<script setup>
import axios from 'axios';
import { onMounted, computed, ref } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
// Get the current date and viewing date
const currentDate = ref(new Date());
const viewingDate = ref(new Date());
const monthDiff = ref(0);
const currentMonth = computed(() => viewingDate.value.toLocaleString('default', { month: 'long' }));
const datesInMonth = ref({});

// Handle changing month click
const disablePreviousMonthButton = computed(() => monthDiff.value - 1 < -2);
const disableNextMonthButton = computed(() => monthDiff.value + 1 > 3);
const handleChangeMonthClick = async (movement) => {
  // Prevent viewing > 3 months and < 2 months
  if (monthDiff.value + movement > 3 || monthDiff.value + movement < -2) {
    return;
  }
  monthDiff.value += movement;

  // Calculate new date
  const newDate = new Date(viewingDate.value);
  newDate.setMonth(newDate.getMonth() + movement);
  // Assign new date
  viewingDate.value = newDate;
  await getDatesInMonth();
};

// Get WFH Requests
const getWFHRequests = async () => {
  try {
    let API_ROUTE = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_API_ENDPOINT
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;
    const res = await axios.get(API_ROUTE + '/wfh_request/user', {
      params: { userID: userStore.userInfo.Staff_ID },
    });
    // Convert the string date into Date object
    for (let requestObj of res.data.results) {
      for (let dateObj of requestObj['Dates']) {
        dateObj['WFH_Date'] = new Date(dateObj['WFH_Date']).toLocaleDateString('en-CA');
        dateObj['WFH_Time'] = dateObj['WFH_Time'].split(',');
      }
    }
    // Return requests
    return res.data.results;
  } catch (error) {
    console.error(error);
    return;
  }
};
// Calculate the days in the current month with formatting and requests
const getDatesInMonth = async () => {
  const year = viewingDate.value.getFullYear();
  const month = viewingDate.value.getMonth(); // 0-based month
  const days = new Date(year, month + 1, 0).getDate(); // Get last day of the month
  // Month names for formatting
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Create an array of all days in the month with formatting
  let newMap = {};
  for (let i = 0; i < days; i++) {
    const date = new Date(year, month, i + 1);
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    const formattedDate = `${monthNames[month]} ${i + 1}, ${year} (${dayName})`;
    // New entry
    newMap[date.toLocaleDateString('en-CA')] = { dateObj: date, formattedDate, requests: [] };
  }
  datesInMonth.value = newMap;

  // Get all requests in month
  let requests = await getWFHRequests();
  // Add requests to the datesInMonth object
  for (let requestObj of requests) {
    for (let requestDate of requestObj['Dates']) {
      if (!(requestDate['WFH_Date'] in datesInMonth.value)) {
        continue;
      }
      // Add request
      datesInMonth.value[requestDate['WFH_Date']]['requests'].push(requestObj);
      // console.log('requestDate["WFH_Date"]: ', requestDate['WFH_Date']);
      // console.log(datesInMonth.value[requestDate['WFH_Date']]);
    }
  }
};

// Use onMounted to initialize currentDate once
onMounted(async () => {
  currentDate.value = new Date();
  viewingDate.value = new Date();
  await getDatesInMonth();
});
</script>

<template>
  <BContainer>
    <BRow>
      <BCol>
        <h1>Staff Schedule</h1>
      </BCol>
    </BRow>
    <BRow>
      <BCol cols="3">
        <BDropdown text="Dropdown">
          <BDropdownItem @click="console.log('FIRST')">First Action</BDropdownItem>
          <BDropdownItem @click="console.log('SECOND')">Second Action</BDropdownItem>
          <BDropdownItem @click="console.log('THIRD')">Third Action</BDropdownItem>
          <BDropdownItem disabled>Disabled action</BDropdownItem>
        </BDropdown>
      </BCol>
      <BCol cols="3"> </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BButton @click="handleChangeMonthClick(-1)" :disabled="disablePreviousMonthButton" pill>
          {{ '<' }}
        </BButton>
      </BCol>
      <BCol class="text-center">
        <h3>{{ currentMonth }}</h3>
      </BCol>
      <BCol class="d-flex justify-content-end"
        ><BButton
          @click="handleChangeMonthClick(1)"
          :disabled="disableNextMonthButton"
          pill
          class="align-right"
          >{{ '>' }}</BButton
        ></BCol
      >
    </BRow>
    <BRow>
      <!-- Render all dates in month -->
      <BCol>
        <div v-for="(dateValueObject, dateKeyStr) in datesInMonth" :key="dateKeyStr">
          <BButton v-b-toggle="dateKeyStr" class="m-1">
            {{ dateValueObject['formattedDate'] }}
          </BButton>
          <!-- Element to collapse -->
          <BCollapse :id="dateKeyStr">
            <!-- <BCard>I am collapsible content!</BCard> -->
            <BCard
              v-for="requestObj in dateValueObject['requests']"
              :key="requestObj['Request_ID']"
            >
              {{ requestObj['Reason'] }}
            </BCard>
          </BCollapse>
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style></style>
