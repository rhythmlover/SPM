<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Define props
const props = defineProps({
  wfhRequests: {
    type: Object,
    default() {
      return {};
    },
  },
});

const todayDate = ref(new Date());
const viewingDate = ref(new Date());
const datesInPeriod = ref({});
const isLoading = ref(true);
const isMonthView = ref(true); // Filtering by day or month
const dayWeekFilterDropdownSelectOptions = [
  { value: true, text: 'Month' },
  { value: false, text: 'Week' },
];
const scheduleListError = ref(null);
const getCurrentPeriod = computed(() => {
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

  // Populate map of dates in datesInPeriod
  let newMap = {};
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const formattedDate = d.toLocaleDateString('en-CA');
    newMap[formattedDate] = { dateObj: new Date(d), requests: [] };
  }
  datesInPeriod.value = newMap;

  // Add requests
  await addRequestsToDatesMap();

  // Loading done
  isLoading.value = false;
};

/**
 * Add requests in prop.wfhRequests to datesInPeriod map that share the same date
 */
const addRequestsToDatesMap = () => {
  // Map requests to the datesInPeriod map
  const wfhStringDateKeys = Object.keys(props.wfhRequests);
  const datesInPeriodKeys = Object.keys(datesInPeriod.value);

  for (let wfhStringKey of wfhStringDateKeys) {
    // Same date string key?
    if (!datesInPeriodKeys.includes(wfhStringKey)) continue;
    // Add requests in same date
    datesInPeriod.value[wfhStringKey]['requests'].push(...props.wfhRequests[wfhStringKey]);
  }
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

const formatDateFromStr = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

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

watch(
  () => props.wfhRequests,
  () => {
    // Clear existing requests
    for (let dateStringKey in datesInPeriod.value) {
      datesInPeriod.value[dateStringKey]['requests'] = [];
    }
    // Add new requests in
    addRequestsToDatesMap();
  },
);
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
        <h2>{{ getCurrentPeriod }}</h2>
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
                        <BTd> {{ requestObj['Request_Period'] }}</BTd>
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
