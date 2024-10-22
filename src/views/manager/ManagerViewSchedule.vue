<!-- ManagerViewSchedule.vue -->
<script setup>
import { inject, ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import { usePeriodChange } from '@/components/usePeriodChange';
import ScheduleList from '@/components/staff/ScheduleList.vue';

const API_ROUTE = inject('API_ROUTE');
const subordinateHierarchy = ref(null);
const allRequests = ref([]);
const isLoading = ref(true);
const dayWeekFilterDropdownSelectOptions = [
  { value: true, text: 'Month' },
  { value: false, text: 'Week' },
];
const isMonthView = ref(true);
const todayDate = ref(new Date());
const {
  datesInPeriod,
  currentPeriodString,
  getAbleToShiftPeriod,
  shiftPeriod,
} = usePeriodChange({
  todayDate: todayDate,
  isMonthView: isMonthView,
});

// Filter-related refs
const statusOptions = ref([
  { value: 'Approved', text: 'Approved' },
  { value: 'Pending', text: 'Pending' },
  { value: 'Rejected', text: 'Rejected' },
  { value: 'Withdrawn', text: 'Withdrawn' },
  { value: 'Withdrawal Pending', text: 'Withdrawal Pending' },
]);
const selectedStatuses = ref([]);
const wfhTimeOptions = ref([
  { value: 'FULL', text: 'Full Day' },
  { value: 'AM', text: 'AM' },
  { value: 'PM', text: 'PM' },
]);
const selectedWfhTimes = ref([]);
const selectAllWfhTimes = ref(true);

//Calls subordinateHierarchy API, gets all the WFH requests and then updates the calender list view
const updateAllSubordinateWFH = async () => {
  isLoading.value = true;
  let Staff_ID = localStorage.getItem('staffID');

  try {
    let res = await axios.get(API_ROUTE + '/teamlist/subordinateHierarchy', {
      params: { Staff_ID },
    });
    subordinateHierarchy.value = res.data;
    console.log('Subordinate Hierarchy:', subordinateHierarchy.value);

    // Populate allRequests
    allRequests.value = subordinateHierarchy.value.subordinates.flatMap(
      (subordinate) =>
        subordinate.wfhRequests.map((request) => ({
          ...request,
          Staff: {
            Staff_ID: subordinate.Staff_ID,
            Staff_FName: subordinate.Staff_FName,
            Staff_LName: subordinate.Staff_LName,
            Position: subordinate.position,
            Reporting_Manager: subordinate.Reporting_Manager,
          },
        })),
    );
  } catch (error) {
    console.error('Error fetching subordinate hierarchy:', error);
  } finally {
    isLoading.value = false;
  }
};

const filteredDates = computed(() => {
  const filtered = {};
  Object.entries(datesInPeriod.value).forEach(([date, dayInfo]) => {
    const filteredRequests = allRequests.value.filter(
      (request) =>
        new Date(request.WFH_Date).toLocaleDateString('en-CA') === date &&
        selectedStatuses.value.includes(request.Status) &&
        selectedWfhTimes.value.includes(request.Request_Period),
    );
    filtered[date] = { ...dayInfo, requests: filteredRequests };
  });
  return filtered;
});

onMounted(async () => {
  await updateAllSubordinateWFH();
  selectedStatuses.value = statusOptions.value.map((status) => status.value);
  selectedWfhTimes.value = wfhTimeOptions.value.map((option) => option.value);
});

const toggleAllWfhTimes = () => {
  if (selectAllWfhTimes.value) {
    selectedWfhTimes.value = wfhTimeOptions.value.map((option) => option.value);
  } else {
    selectedWfhTimes.value = [];
  }
};

watch(selectedWfhTimes, (newValue) => {
  selectAllWfhTimes.value = newValue.length === wfhTimeOptions.value.length;
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

          <!-- Filters -->
          <BRow class="my-2">
            <BCol class="col-4 col-md-2">
              <BFormSelect
                v-model="isMonthView"
                :options="dayWeekFilterDropdownSelectOptions"
              />
            </BCol>
            <BCol>
              <BDropdown text="Filter by Status" auto-close="outside">
                <BDropdownForm>
                  <BFormCheckbox
                    v-for="option in statusOptions"
                    :key="option.value"
                    v-model="selectedStatuses"
                    :value="option.value"
                  >
                    {{ option.text }}
                  </BFormCheckbox>
                </BDropdownForm>
              </BDropdown>
            </BCol>
            <BCol>
              <BDropdown text="Filter by WFH Time" auto-close="outside">
                <BDropdownForm>
                  <BFormCheckbox
                    v-model="selectAllWfhTimes"
                    @change="toggleAllWfhTimes"
                  >
                    Select All
                  </BFormCheckbox>
                  <BFormCheckbox
                    v-for="option in wfhTimeOptions"
                    :key="option.value"
                    v-model="selectedWfhTimes"
                    :value="option.value"
                  >
                    {{ option.text }}
                  </BFormCheckbox>
                </BDropdownForm>
              </BDropdown>
            </BCol>
          </BRow>
        </BContainer>

        <BOverlay :show="isLoading" rounded="sm">
          <ScheduleList :wfh-requests="filteredDates" />
        </BOverlay>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style scoped></style>
