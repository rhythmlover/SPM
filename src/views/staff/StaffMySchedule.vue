<script setup>
import axios from 'axios';
import { inject, onMounted, computed, ref } from 'vue';
import { useUserStore } from '@/stores/user';
import IBiUpArrow from '~icons/bi/caret-up-fill';

const userStore = useUserStore();
// Get the current date and viewing date
const todayDate = ref(new Date());
const viewingDate = ref(new Date());
const viewingMonth = computed(() => viewingDate.value.toLocaleString('default', { month: 'long' }));
const monthDiff = ref(0);
const datesInViewingMonth = ref({}); // Store days in the viewing month
const weeksInViewingMonth = ref({}); // Store weeks in the viewing month
const API_ROUTE = inject('API_ROUTE');
// Filtering by day or month
const dayView = ref(true);
const dayWeekFilterDropdownSelectOptions = [
  { value: true, text: 'Day' },
  { value: false, text: 'Week' },
];

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
  await getDatesInViewingMonth();
};

// Get WFH Requests
const getWFHRequests = async () => {
  try {
    const res = await axios.get(API_ROUTE + '/wfh_request/user', {
      params: { staffID: userStore.userInfo.Staff_ID },
    });
    // Convert the string date into Date object
    for (let requestObj of res.data.results) {
      for (let dateObj of requestObj['Dates']) {
        dateObj['WFH_Date'] = new Date(dateObj['WFH_Date']).toLocaleDateString('en-CA');
        // dateObj['WFH_Time'] = dateObj['WFH_Time'].split(',');
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
const getDatesInViewingMonth = async () => {
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

  // Create array of all days & weeks in viewing month
  let newWeeks = [];
  let currentWeek = [];
  let newDaysMap = {};
  for (let i = 0; i < days; i++) {
    // New date
    const date = new Date(year, month, i + 1);
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    const formattedDate = `${monthNames[month]} ${i + 1}, ${year} (${dayName})`;
    // Add day to days map
    let newDayObj = { dateObj: date, formattedDate, requests: [] };
    newDaysMap[date.toLocaleDateString('en-CA')] = newDayObj;

    // Add day to current week
    currentWeek.push(newDayObj);
    // If day is Sunday (date.getDay() == 6), push the current week to newWeeks and start a new week
    if (date.getDay() == 6) {
      newWeeks.push(currentWeek);
      currentWeek = [];
    }
  }
  // Leftover days in currentWeek, push as final week
  if (currentWeek.length > 0) {
    newWeeks.push(currentWeek);
  }
  // Update refs
  datesInViewingMonth.value = newDaysMap;
  weeksInViewingMonth.value = newWeeks;

  // Get all requests in month
  let requests = await getWFHRequests();
  for (let requestObj of requests) {
    let newRequestObj = { ...requestObj };
    delete newRequestObj['Dates'];
    // Add dates of requests to the datesInViewingMonth object with the same date
    for (let requestDate of requestObj['Dates']) {
      if (!(requestDate['WFH_Date'] in datesInViewingMonth.value)) {
        continue;
      }
      // Add request's date to the obj
      datesInViewingMonth.value[requestDate['WFH_Date']]['requests'].push({
        ...newRequestObj,
        Date: requestDate,
      });
      // console.log('requestDate["WFH_Date"]: ', requestDate['WFH_Date']);
      // console.log(datesInViewingMonth.value[requestDate['WFH_Date']]);
    }
  }
};

// Get status color for pill
const getStatusPillColor = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'Warning';
    default:
      return 'secondary';
  }
};
// Get CSS to rotate icon
const getDateCollapseIconRotated = (visible) => {
  return {
    transform: visible ? 'rotateZ(180deg)' : 'rotateZ(0deg)',
    transition: 'transform 0.2s ease',
  };
};

onMounted(async () => {
  // Use onMounted to initialize dates once
  todayDate.value = new Date();
  viewingDate.value = new Date();
  await getDatesInViewingMonth();
});
</script>

<template>
  <BContainer :style="{ marginTop: '100px' }">
    <BRow>
      <BCol>
        <h1>My Schedule</h1>
      </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BButton @click="handleChangeMonthClick(-1)" :disabled="disablePreviousMonthButton" pill>
          {{ '<' }}
        </BButton>
      </BCol>
      <BCol class="text-center">
        <h3>{{ viewingMonth }}</h3>
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
    <!-- Filters -->
    <BRow class="my-2">
      <!-- Day / Week Filter -->
      <BCol class="col-4 col-md-2">
        <BFormSelect v-model="dayView" :options="dayWeekFilterDropdownSelectOptions" />
      </BCol>
    </BRow>
    <BRow>
      <!-- Render all dates in month in day view -->
      <BCol v-if="dayView == true">
        <div
          v-for="(dateValueObject, dateKeyStr) in datesInViewingMonth"
          :key="dateKeyStr"
          class="my-3"
        >
          <!-- Element to collapse -->
          <BCollapse :id="dateKeyStr">
            <template #header="{ visible, toggle, id }">
              <div
                class="d-block"
                role="button"
                :aria-expanded="visible"
                :aria-controls="id"
                @click="toggle"
              >
                <div class="d-flex justify-content-between border-bottom border-2 fw-bold">
                  {{ dateValueObject['formattedDate'] }}
                  <IBiUpArrow :style="getDateCollapseIconRotated(visible)" />
                </div>
              </div>
            </template>

            <BCard>
              <BTableSimple hover small caption-top responsive>
                <BThead head-variant="dark">
                  <BTr>
                    <BTh>Name</BTh>
                    <BTh>Position</BTh>
                    <BTh>WFH Time</BTh>
                    <BTh>Status</BTh>
                  </BTr>
                </BThead>
                <BTbody>
                  <BTr
                    v-for="requestObj in dateValueObject['requests']"
                    :key="requestObj['Request_ID']"
                  >
                    <BTd>
                      {{
                        `${requestObj['Staff']['Staff_FName']} ${requestObj['Staff']['Staff_LName']}`
                      }}
                    </BTd>
                    <BTd> {{ requestObj['Staff']['Position'] }}</BTd>
                    <BTd> {{ requestObj['Date']['WFH_Time'] }}</BTd>
                    <BTd>
                      <BBadge :variant="getStatusPillColor(requestObj['Status'])" pill>
                        {{ requestObj['Status'] }}
                      </BBadge>
                    </BTd>
                  </BTr>
                </BTbody>
              </BTableSimple>
            </BCard>
          </BCollapse>
        </div>
      </BCol>

      <!-- Render all dates in month in week view -->
      <BCol v-else>
        {{ console.log('weeksInViewingMonth:', weeksInViewingMonth) }}
        <div v-for="weekList in weeksInViewingMonth" :key="weekList[0].formattedDate" class="my-3">
          <!-- Element to collapse -->
          <BCollapse :id="weekList[0].formattedDate">
            <template #header="{ visible, toggle, id }">
              <div
                class="d-block"
                role="button"
                :aria-expanded="visible"
                :aria-controls="id"
                @click="toggle"
              >
                <div class="d-flex justify-content-between border-bottom border-2 fw-bold">
                  {{
                    weekList[0].formattedDate + ' - ' + weekList[weekList.length - 1].formattedDate
                  }}
                  <IBiUpArrow :style="getDateCollapseIconRotated(visible)" />
                </div>
              </div>
            </template>

            <BCard>
              <BTableSimple hover small caption-top responsive>
                <BThead head-variant="dark">
                  <BTr>
                    <BTh>Name</BTh>
                    <BTh>Position</BTh>
                    <BTh>WFH Time</BTh>
                    <BTh>Status</BTh>
                  </BTr>
                </BThead>
                <BTbody v-for="dayObj in weekList" :key="dayObj['formattedDate']">
                  <BTr v-for="requestObj in dayObj['requests']" :key="requestObj['Request_ID']">
                    <BTd>
                      {{
                        `${requestObj['Staff']['Staff_FName']} ${requestObj['Staff']['Staff_LName']}`
                      }}
                    </BTd>
                    <BTd> {{ requestObj['Staff']['Position'] }}</BTd>
                    <BTd> {{ requestObj['Date']['WFH_Time'] }}</BTd>
                    <BTd>
                      <BBadge :variant="getStatusPillColor(requestObj['Status'])" pill>
                        {{ requestObj['Status'] }}
                      </BBadge>
                    </BTd>
                  </BTr>
                </BTbody>
              </BTableSimple>
            </BCard>
          </BCollapse>
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style></style>
