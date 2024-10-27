<!-- StaffTeamScheduleView.vue -->
<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import axios from 'axios';
import ScheduleList from '@/components/staff/ScheduleList.vue';
import TeammateFilter from '@/components/TeammateFilter.vue';
import { usePeriodChange } from '@/components/usePeriodChange';

const API_ROUTE = inject('API_ROUTE');
const staffID = inject('staffID');

const wfhRequests = ref({});
const error = ref(null);
const loading = ref(true);

const isMonthView = ref(true);
const todayDate = ref(new Date());

const {
  datesInPeriod,
  currentPeriodString,
  getAbleToShiftPeriod,
  shiftPeriod,
} = usePeriodChange({
  todayDate,
  isMonthView,
});

const dayWeekFilterDropdownSelectOptions = [
  { value: true, text: 'Month' },
  { value: false, text: 'Week' },
];

const teammates = ref([]);
const selectedTeammates = ref([]);

// New status filter options
const statusOptions = ref([
  { value: 'Pending', text: 'Pending' },
  { value: 'Withdrawal Pending', text: 'Withdrawal Pending' },
  { value: 'Approved', text: 'Approved' },
  { value: 'Rejected', text: 'Rejected' },
]);
const selectedStatuses = ref([]);

const getWFHRequests = async () => {
  try {
    const res = await axios.get(`${API_ROUTE}/teamlist/byReportingManager`, {
      params: { Staff_ID: staffID.value },
    });

    if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
      throw new Error(
        'Received HTML instead of JSON. Check API endpoint configuration.',
      );
    }

    if (!Array.isArray(res.data.employeeRequests)) {
      throw new Error('Invalid data format: employeeRequests is not an array');
    }

    const requests = res.data.employeeRequests.flatMap((employeeObj) => {
      if (!Array.isArray(employeeObj.wfhRequests)) {
        console.warn(
          `Invalid wfhRequests for employee ${employeeObj.employee.Staff_ID}`,
        );
        return [];
      }
      return employeeObj.wfhRequests.map((wfhRequest) => ({
        ...wfhRequest,
        Staff: {
          Staff_FName: employeeObj.employee.Staff_FName,
          Staff_LName: employeeObj.employee.Staff_LName,
          Staff_ID: employeeObj.employee.Staff_ID.toString(),
          Position: employeeObj.employee.position,
        },
        WFH_Date: new Date(wfhRequest.WFH_Date).toLocaleDateString('en-CA'),
      }));
    });

    teammates.value = [
      ...new Set(
        res.data.employeeRequests.map((employeeObj) => ({
          Staff_ID: employeeObj.employee.Staff_ID.toString(),
          Staff_FName: employeeObj.employee.Staff_FName,
          Staff_LName: employeeObj.employee.Staff_LName,
        })),
      ),
    ];

    selectedTeammates.value = teammates.value.map(
      (teammate) => teammate.Staff_ID,
    );

    return requests;
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
    throw error;
  }
};

const mapRequestsToDates = (requests) => {
  let dateMap = { ...datesInPeriod.value };
  for (const request of requests) {
    const datestr = request.WFH_Date;
    if (datestr in dateMap) {
      if (!dateMap[datestr].requests) {
        dateMap[datestr].requests = [];
      }
      // Check if the request already exists to avoid duplicates
      const existingRequestIndex = dateMap[datestr].requests.findIndex(
        (r) => r.Request_ID === request.Request_ID,
      );
      if (existingRequestIndex === -1) {
        dateMap[datestr].requests.push(request);
      }
    } else {
      console.warn(`Date ${datestr} not found in dateMap`);
    }
  }
  return dateMap;
};

const fetchAndMapRequests = async () => {
  loading.value = true;
  error.value = null;
  try {
    const requests = await getWFHRequests();
    wfhRequests.value = mapRequestsToDates(requests);
  } catch (err) {
    console.error('Error in fetchAndMapRequests:', err);
    error.value = err.message;
    wfhRequests.value = {};
  } finally {
    loading.value = false;
  }
};

const filteredWFHRequests = computed(() => {
  const filtered = {};
  Object.entries(wfhRequests.value).forEach(([date, dayInfo]) => {
    if (dayInfo.requests && Array.isArray(dayInfo.requests)) {
      const filteredRequests = dayInfo.requests.filter(
        (request) =>
          selectedTeammates.value.includes(request.Staff.Staff_ID) &&
          (selectedStatuses.value.length === 0 ||
            selectedStatuses.value.includes(request.Status)),
      );
      filtered[date] = { ...dayInfo, requests: filteredRequests };
    } else {
      filtered[date] = { ...dayInfo, requests: [] };
    }
  });
  return filtered;
});

watch([currentPeriodString, isMonthView], async () => {
  await fetchAndMapRequests();
});

onMounted(async () => {
  await fetchAndMapRequests();
});
</script>

<template>
  <BContainer>
    <BRow>
      <BCol>
        <BContainer>
          <BRow class="mb-4 align-items-center">
            <BCol class="d-flex justify-content-center">
              <BButton
                :disabled="!getAbleToShiftPeriod(-1)[0]"
                @click="shiftPeriod(-1)"
                variant="outline-primary"
                >Previous</BButton
              >
            </BCol>
            <BCol class="text-center">
              <h2>{{ currentPeriodString }}</h2>
            </BCol>
            <BCol class="d-flex justify-content-center">
              <BButton
                :disabled="!getAbleToShiftPeriod(1)[0]"
                @click="shiftPeriod(1)"
                variant="outline-primary"
                >Next</BButton
              >
            </BCol>
          </BRow>

          <BRow class="my-2">
            <BCol class="col-4 col-md-2">
              <BFormSelect
                v-model="isMonthView"
                :options="dayWeekFilterDropdownSelectOptions"
              />
            </BCol>
            <BCol class="col-8 col-md-10">
              <TeammateFilter
                :teammates="teammates"
                v-model:selectedTeammates="selectedTeammates"
                :statusOptions="statusOptions"
                v-model:selectedStatuses="selectedStatuses"
              />
            </BCol>
          </BRow>
        </BContainer>

        <BAlert v-if="error" show variant="danger">{{ error }}</BAlert>
        <BSpinner v-if="loading" label="Loading..."></BSpinner>
        <ScheduleList v-else-if="!error" :wfh-requests="filteredWFHRequests" />
      </BCol>
    </BRow>
  </BContainer>
</template>
