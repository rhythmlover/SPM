<script setup>
import axios from 'axios';
import { inject, ref, onMounted, watch } from 'vue';
import HrScheduleList from '@/components/hr/HrScheduleList.vue';
import { usePeriodChange } from '@/components/usePeriodChange';

const API_ROUTE = inject('API_ROUTE');
const isLoading = ref(false);
const WFHRequests = ref({});
const myDates = ref({});
const dayWeekFilterDropdownSelectOptions = [
  { value: true, text: 'Month' },
  { value: false, text: 'Week' },
];
const isMonthView = ref(true);
const departmentFilterDropdownSelectOptions = [
  { value: 'All', text: 'All' },
  { value: 'CEO', text: 'CEO' },
  { value: 'Sales', text: 'Sales' },
  { value: 'Solutioning', text: 'Solutioning' },
  { value: 'Engineering', text: 'Engineering' },
  { value: 'HR', text: 'HR' },
  { value: 'Finance', text: 'Finance' },
  { value: 'Consultancy', text: 'Consultancy' },
  { value: 'IT', text: 'IT' },
];
const departmentView = ref('All');
const departmentCount = ref(0);

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

/**
 * Retrieve all of my WFH requests that have same date present in dateMap
 */
const getWFHRequests = async () => {
  let staffID = localStorage.getItem('staffID');

  // Fetch requests
  let requestsMap = {};
  try {
    let res = await axios.get(API_ROUTE + '/wfh-request/all', {
      params: { staffID },
    });

    for (let requestObj of res.data.results) {
      // Convert MySQL date into JS Date object and String representations
      let requestDateObj = new Date(requestObj['WFH_Date']);
      let requestDateString = requestDateObj.toLocaleDateString('en-CA');
      requestObj['WFH_Date'] = requestDateString;

      // Date created before?
      if (!(requestDateString in requestsMap)) {
        requestsMap[requestDateString] = [];
      }
      // Add into map
      requestsMap[requestDateString].push(requestObj);
    }
  } catch (error) {
    console.error(error);
  }

  // Update ref
  WFHRequests.value = requestsMap;
  return requestsMap;
};

/**
 * Map WFH requests to dates in period from usePeriodChange() Hook
 */
const mapRequestsToDates = () => {
  let dateMap = {};
  try {
    // Get dates in period
    dateMap = { ...datesInPeriod.value };
    // Map requests to date
    for (const datestr in dateMap) {
      if (!(datestr in WFHRequests.value)) continue;
      dateMap[datestr]['requests'] = WFHRequests.value[datestr];
    }
  } catch (error) {
    console.error(error);
  }

  // Update ref
  myDates.value = dateMap;
};

/**
 * Fetches the total number of employees in that Department
 * @param departmentName Name of the Department to get
 */
const getDepartmentCount = async (departmentName) => {
  try {
    let res = await axios.get(API_ROUTE + '/employee/department-count', {
      params: { departmentName },
    });

    // Update ref
    departmentCount.value = res.data['total'];
  } catch (error) {
    console.error(error);
  }

  return departmentCount.value;
};

/**
 * Filter the WFH requests to only include from specified department
 */
const filterRequestsFromDepartment = async () => {
  // Get total number of employees for filtered department
  let newDepartmentCount = await getDepartmentCount(departmentView.value);

  let dateMap = { ...myDates.value };
  try {
    // Loop through all dates
    for (const dateObj of Object.values(dateMap)) {
      let validRequests = [];
      let wfh_count = new Set();
      for (let r of dateObj['requests']) {
        // Filter by only that department
        if (
          departmentView.value != 'All' &&
          r['Staff']['Department']['Dept_Name'] != departmentView.value
        )
          continue;
        validRequests.push(r);

        // Calculate how many employees WFH
        wfh_count.add(r['Staff_ID']);
      }
      // Assign back
      dateObj['requests'] = validRequests;
      dateObj['total_count'] = newDepartmentCount;
      dateObj['wfh_count'] = wfh_count.size;
    }
  } catch (error) {
    console.error(error);
  }
  // Update ref
  myDates.value = dateMap;
};

watch([currentPeriodString, isMonthView, departmentView], async () => {
  isLoading.value = true;
  mapRequestsToDates();
  await filterRequestsFromDepartment();
  isLoading.value = false;
});
onMounted(async () => {
  isLoading.value = true;
  await getWFHRequests();
  mapRequestsToDates();
  await filterRequestsFromDepartment();
  isLoading.value = false;
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
            <!-- Day / Week Filter -->
            <BCol class="col-4 col-md-2">
              <BFormSelect
                v-model="isMonthView"
                :options="dayWeekFilterDropdownSelectOptions"
              />
            </BCol>
            <!-- Department Filter -->
            <BCol class="col-4 col-md-2">
              <BFormSelect
                v-model="departmentView"
                :options="departmentFilterDropdownSelectOptions"
              />
            </BCol>
          </BRow>
        </BContainer>

        <BContainer v-if="isLoading">
          <BRow>
            <BCol class="d-flex justify-content-center">
              <BSpinner />
            </BCol>
          </BRow>
        </BContainer>
        <HrScheduleList :wfh-requests="myDates" :employee-count="{}" v-else />
      </BCol>
    </BRow>
  </BContainer>
</template>

<style></style>
