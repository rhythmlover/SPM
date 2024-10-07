<script setup>
import axios from 'axios';
import { inject, ref, onMounted, watch } from 'vue';
import ScheduleList from '@/components/staff/ScheduleList.vue';
import { usePeriodChange } from '@/components/usePeriodChange';

const API_ROUTE = inject('API_ROUTE');
const myWFHRequests = ref({});
const myDates = ref({});
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

/**
 * Retrieve all of my WFH requests that have same date present in dateMap
 * @param dateMap map of dates
 */
const getWFHRequests = async () => {
  let staffID = localStorage.getItem('staffID');

  // Fetch requests
  let requestsMap = {};
  try {
    let res = await axios.get(API_ROUTE + '/wfh-request/user', {
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
  myWFHRequests.value = requestsMap;
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
      if (!(datestr in myWFHRequests.value)) continue;
      dateMap[datestr]['requests'] = myWFHRequests.value[datestr];
    }
  } catch (error) {
    console.error(error);
  }

  // Update ref
  myDates.value = dateMap;
};

watch([currentPeriodString, isMonthView], async () => {
  mapRequestsToDates();
});
onMounted(async () => {
  await getWFHRequests();
  mapRequestsToDates();
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
          </BRow>
        </BContainer>

        <!-- <BSpinner /> -->
        <ScheduleList :wfh-requests="myDates" />
      </BCol>
    </BRow>
  </BContainer>
</template>

<style></style>
