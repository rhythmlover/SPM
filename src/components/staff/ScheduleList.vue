<script setup>
import { inject, ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

// Define props
const props = defineProps({
  staffId: {
    type: Number,
    required: true,
  },
  isStaffView: {
    type: Boolean,
    default: true,
  },
});

const todayDate = ref(new Date());
const viewingDate = ref(new Date());
const datesInPeriod = ref({});
const isLoading = ref(true);
// Filtering by day or month
const isMonthView = ref(true);
const dayWeekFilterDropdownSelectOptions = [
  { value: true, text: 'Month' },
  { value: false, text: 'Week' },
];
const scheduleListError = ref(null);
const API_ROUTE = inject('API_ROUTE');

const currentPeriod = computed(() => {
  if (isMonthView.value) {
    return viewingDate.value.toLocaleString('default', { month: 'long', year: 'numeric' });
  } else {
    const endOfWeek = new Date(viewingDate.value);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${viewingDate.value.toLocaleDateString('default', {
      month: 'short',
      day: 'numeric',
    })} - ${endOfWeek.toLocaleDateString('default', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }
});

/**
 * Get all dates in current period
 */
const getDatesInPeriod = async () => {
  // Loading
  isLoading.value = true;
  // Reset Error
  scheduleListError.value = null;

  // Calculate Start, End dates based on period selected
  let startDate, endDate;
  const year = viewingDate.value.getFullYear();
  const month = viewingDate.value.getMonth();
  if (isMonthView.value) {
    startDate = new Date(year, month, 1);
    endDate = new Date(year, month + 1, 0);
  } else {
    startDate = new Date(viewingDate.value);
    endDate = new Date(viewingDate.value);
    endDate.setDate(endDate.getDate() + 6);
  }

  // Populate map of dates in period
  let newMap = {};
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const formattedDate = d.toLocaleDateString('en-CA');
    newMap[formattedDate] = { dateObj: new Date(d), requests: [] };
  }

  // Get requests for each date in period
  try {
    newMap = await getWFHRequests(newMap);
    datesInPeriod.value = newMap;
  } catch (err) {
    scheduleListError.value = err.message;
  }

  // Loading done
  isLoading.value = false;
};

/**
 * Shift the current period
 * @param movement how many periods to shift
 */
const handlePeriodChange = async (movement) => {
  let [ableToShift, shiftedDate] = ableToShiftPeriod(movement);
  // Assign new date if can shift
  if (!ableToShift) return;
  viewingDate.value = shiftedDate;
};
const ableToShiftPeriod = (movement) => {
  // Calculate new date
  let newDate = null;
  if (isMonthView.value) {
    newDate = new Date(viewingDate.value.getFullYear(), viewingDate.value.getMonth() + movement, 1);
  } else {
    newDate = new Date(
      viewingDate.value.getFullYear(),
      viewingDate.value.getMonth(),
      viewingDate.value.getDate() + movement * 7,
    );
  }

  // Prevent viewing > 3 months and < 2 months
  let monthDiff = getMonthDifference(todayDate.value, newDate);
  if (monthDiff > 3 || monthDiff < -2) {
    return [false, null];
  }
  return [true, newDate];
};
const getMonthDifference = (startDate, endDate) => {
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth(); // Months are zero-based
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  // Calculate the year and month difference
  const yearDifference = endYear - startYear;
  const monthDifference = endMonth - startMonth;

  // Total month difference
  return yearDifference * 12 + monthDifference;
};

/**
 * Retrieve all WFH requests that have same date present in dateMap
 * @param dateMap map of dates
 */
const getWFHRequests = async (dateMap) => {
  try {
    // Staff own schedule or Team?
    if (props.isStaffView) {
      const res = await axios.get(API_ROUTE + '/wfh_request/user', {
        params: { staffID: props.staffId },
      });
      // Convert the string date into Date object
      for (let requestObj of res.data.results) {
        for (let dateObj of requestObj['Dates']) {
          dateObj['WFH_Date'] = new Date(dateObj['WFH_Date']).toLocaleDateString('en-CA');
        }
      }

      // Map requests to the date map
      for (let requestObj of res.data.results) {
        let newRequestObj = { ...requestObj };
        delete newRequestObj['Dates'];
        // Add dates of requests to the datesInViewingMonth object with the same date
        for (let requestDate of requestObj['Dates']) {
          if (!(requestDate['WFH_Date'] in dateMap)) {
            continue;
          }
          // Add request's date to the obj
          dateMap[requestDate['WFH_Date']]['requests'].push({
            ...newRequestObj,
            Date: requestDate,
          });
        }
      }
    } else {
      //   const res = await axios.get(`${API_ROUTE}/teamlist/byReportingManager`, {
      //     params: { Staff_ID: props.staffId },
      //   });
      //   if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
      //     throw new Error('Received HTML instead of JSON. Check API endpoint configuration.');
      //   }
      //   if (Array.isArray(res.data.employeeRequests)) {
      //     return res.data.employeeRequests.flatMap((employeeObj) =>
      //       employeeObj.wfhRequests.map((wfhRequest) => ({
      //         ...wfhRequest,
      //         Staff_FName: employeeObj.employee.Staff_FName,
      //         Staff_LName: employeeObj.employee.Staff_LName,
      //         Staff_ID: employeeObj.employee.Staff_ID.toString(),
      //         Request_Date: new Date(wfhRequest.Request_Date).toLocaleDateString('en-CA'),
      //       })),
      //     );
      //   } else {
      //     throw new Error('employeeRequests is not an array');
      //   }
    }
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
    throw error;
  }

  // Return dateMap
  return dateMap;
};

const formatDateFromStr = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// const getStatusVariant = (status) => {
//   return status.toLowerCase() === 'pending' ? 'warning' : 'success';
// };

// const isUserRequest = (request) => {
//   return request.Staff_ID === props.staffId.value.toString();
// };

// const getUserRequestStyle = (request) => {
//   if (isUserRequest(request)) {
//     const color = request.Status.toLowerCase() === 'pending' ? 'yellow' : 'green';
//     return {
//       border: `2px solid ${color}`,
//       boxShadow: `0 0 5px ${color}`,
//     };
//   }
//   return {};
// };

/**
 * Get status color for pill
 */
const getStatusPillColor = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

watch([viewingDate, isMonthView], async () => {
  await getDatesInPeriod();
});
onMounted(async () => {
  await getDatesInPeriod();
});
</script>

<template>
  <BContainer>
    <!-- <b-row class="mb-4">
      <b-col md="6" offset-md="3">
        <b-form-group label="Enter Staff ID:" label-for="staffId" label-class="font-weight-bold">
          <b-form-input
            id="staffId"
            v-model="staffId"
            type="number"
            placeholder="Enter Staff ID"
            @input="fetchSchedule"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-row> -->

    <BRow class="mb-4 align-items-center">
      <BCol class="d-flex justify-content-center">
        <BButton
          :disabled="!ableToShiftPeriod(-1)[0]"
          @click="handlePeriodChange(-1)"
          variant="outline-primary"
          >Previous</BButton
        >
      </BCol>
      <BCol class="text-center">
        <h2>{{ currentPeriod }}</h2>
      </BCol>
      <BCol class="d-flex justify-content-center">
        <BButton
          :disabled="!ableToShiftPeriod(1)[0]"
          @click="handlePeriodChange(1)"
          variant="outline-primary"
          >Next</BButton
        >
      </BCol>
    </BRow>

    <!-- Filters -->
    <BRow class="my-2">
      <!-- Day / Week Filter -->
      <BCol class="col-4 col-md-2">
        <BFormSelect v-model="isMonthView" :options="dayWeekFilterDropdownSelectOptions" />
      </BCol>
    </BRow>

    <BRow>
      <BCol>
        <div v-if="scheduleListError">
          <!-- <b-alert show variant="danger">{{ error }}</b-alert> -->
          <div>{{ error }}</div>
        </div>
        <div v-else>
          <div class="d-flex justify-content-center" v-if="isLoading">
            <BSpinner />
          </div>
          <div v-else>
            <BRow v-for="(dateObject, dateKeyStr) in datesInPeriod" :key="dateKeyStr" class="mb-4">
              <BCol>
                <BCard>
                  <template #header>
                    <h4 class="mb-0">{{ formatDateFromStr(dateKeyStr) }}</h4>
                  </template>
                  <!-- <b-list-group flush>
                  <template v-if="dateObject.requests.length">
                    <b-list-group-item
                      v-for="request in dateObject.requests"
                      :key="request.Request_ID"
                      class="d-flex justify-content-between align-items-center"
                      :class="{ 'user-request': isUserRequest(request) }"
                      :style="getUserRequestStyle(request)"
                    >
                      <div class="d-flex align-items-center">
                        <BBadge
                          pill
                          :variant="getStatusVariant(request.Status)"
                          class="mr-2"
                        ></BBadge>
                        <span class="mr-2">{{ request.Request_Period }}</span>
                        <strong class="ms-2">
                          {{ request.Staff_FName }} {{ request.Staff_LName }}
                          <span v-if="isUserRequest(request)" class="text-primary">(YOU)</span>
                        </strong>
                      </div>
                      <div>
                        <BBadge :variant="getStatusVariant(request.Status)">{{
                          request.Status
                        }}</BBadge>
                        <BBadge v-if="request.Comments" variant="info" class="ml-2">
                          {{ request.Comments }}
                        </BBadge>
                      </div>
                    </b-list-group-item>
                  </template>
                  <b-list-group-item v-else> No WFH requests for this day </b-list-group-item>
                </b-list-group> -->

                  <BTableSimple
                    v-if="dateObject['requests'].length > 0"
                    hover
                    caption-top
                    responsive
                  >
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
                        v-for="requestObj in dateObject['requests']"
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
                  <p v-else>No WFH requests for this day</p>
                </BCard>
              </BCol>
            </BRow>
          </div>
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style scoped>
.staff-team-schedule {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls button {
  margin-right: 10px;
}

.error {
  color: red;
}

.day-schedule {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.day-schedule h3 {
  margin-bottom: 5px;
}
</style>
