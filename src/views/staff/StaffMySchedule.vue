<script setup>
import axios from 'axios';
import { inject, ref, onMounted, watch } from 'vue';
import ScheduleList from '@/components/staff/ScheduleList.vue';
import { usePeriodChange } from '@/components/usePeriodChange';
import { useRouter } from 'vue-router';

const router = useRouter();
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

const getWFHRequests = async () => {
  let staffID = localStorage.getItem('staffID');

  // Fetch requests
  let requestsMap = {};
  try {
    let res = await axios.get(
      API_ROUTE + '/wfh-request/user-recurring-requests',
      {
        params: { staffID },
      },
    );

    for (let requestObj of res.data.results) {
      // Check if the request is recurring
      if (
        requestObj.WFH_Date_Start &&
        requestObj.WFH_Date_End &&
        requestObj.WFH_Day
      ) {
        // Generate individual dates for recurring requests
        const recurringDates = generateRecurringDates(
          new Date(requestObj.WFH_Date_Start),
          new Date(requestObj.WFH_Date_End),
          parseInt(requestObj.WFH_Day),
        );

        for (const date of recurringDates) {
          const dateString = date.toLocaleDateString('en-CA');
          // Clone requestObj to avoid mutation and set WFH_Date
          const clonedRequest = { ...requestObj, WFH_Date: dateString };

          if (!(dateString in requestsMap)) {
            requestsMap[dateString] = [];
          }
          // Add into map
          requestsMap[dateString].push(clonedRequest);
        }
      } else {
        // Handle non-recurring requests
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
    }
  } catch (error) {
    console.error(error);
  }

  // Update ref
  myWFHRequests.value = requestsMap;
  return requestsMap;
};

// Function to generate individual WFH dates from the recurring request
const generateRecurringDates = (start, end, dayOfWeek) => {
  let dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === dayOfWeek) {
      dates.push(new Date(d)); // Clone the date to avoid mutation
    }
  }
  return dates;
};

/**
 * Map WFH requests to dates in period from usePeriodChange() Hook
 */
const mapRequestsToDates = () => {
  let dateMap = {};
  try {
    dateMap = { ...datesInPeriod.value };
    for (const datestr in dateMap) {
      if (!(datestr in myWFHRequests.value)) continue;
      dateMap[datestr]['requests'] = myWFHRequests.value[datestr];
    }
  } catch (error) {
    console.error(error);
  }
  myDates.value = dateMap;
};

const viewMyRequestHistory = () => {
  router.push('/staff-request-history');
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
            <BCol class="col-4 col-md-2 ms-auto">
              <BButton variant="primary" @click="viewMyRequestHistory"
                >Request History</BButton
              >
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
