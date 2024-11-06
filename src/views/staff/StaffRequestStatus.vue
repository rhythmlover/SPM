<script setup>
import axios from 'axios';
import { inject, onMounted, ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';

// Declare `requests` as a prop
const props = defineProps({
  requests: {
    type: Array,
    default: () => [], // Default empty array if no data is passed
  },
});

// Create a local copy of requests to safely modify it
const localRequests = ref([...props.requests]);
const staffID = localStorage.getItem('staffID');

// Watch for changes in props.requests and update localRequests accordingly
watch(
  () => props.requests,
  (newRequests) => {
    localRequests.value = [...newRequests];
  },
);

const API_ROUTE = inject('API_ROUTE');
const isLoading = ref(false);

const formatRequestDate = (isoDate) => {
  const date = new Date(isoDate);
  // Adjust for timezone offset
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  const day = date.getUTCDate();
  const month = date.toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });
  const year = date.getUTCFullYear();
  const weekday = date.toLocaleString('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  });
  return `${month} ${day}, ${year} (${weekday})`;
};

const formatRecurringRequestDate = (isoDate) => {
  const date = new Date(isoDate);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  const day = date.getUTCDate();
  const month = date.toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });
  const year = date.getUTCFullYear();
  return `${month} ${day}, ${year}`;
};

const extractAllRecurringDates = (startDate, endDate, dayOfWeek) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const targetDay = dayOfWeek % 7; // Convert 7 (Sunday) to 0
  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const currentDay = d.getDay();
    if (currentDay === targetDay) {
      dates.push(new Date(d));
    }
  }

  return dates;
};

const extractFirstRecurringDate = (startDate, endDate, dayOfWeek) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const targetDay = dayOfWeek % 7; // Convert 7 (Sunday) to 0

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const currentDay = d.getDay();
    if (currentDay === targetDay) {
      return new Date(d);
    }
  }
  return null;
};

const cantCancelRecurring = (dates) => {
  const currentDate = new Date();
  const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < dates.length; i++) {
    const requestDate = new Date(dates[i]);
    const diff = Math.abs(requestDate - currentDate);

    if (diff <= twoWeeksInMs) {
      return true;
    }
  }
  return false;
};

const canWithdraw = (WFH_Date) => {
  const currentDate = new Date();
  const targetDate = new Date(WFH_Date);
  const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;

  const diff = targetDate - currentDate;
  return Math.abs(diff) > twoWeeksInMs;
};

const canCancel = (WFH_Date) => {
  const currentDate = new Date();
  const targetDate = new Date(WFH_Date);
  const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;

  const diff = targetDate - currentDate;
  return Math.abs(diff) > twoWeeksInMs;
};

// const isWithinTwoWeeks = (WFH_Date, Status) => {
//   const currentDate = new Date();
//   const twoWeeksBefore = new Date(WFH_Date);
//   twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
//   const twoWeeksAfter = new Date(WFH_Date);
//   twoWeeksAfter.setDate(twoWeeksAfter.getDate() + 14);

//   return (
//     currentDate >= twoWeeksBefore &&
//     currentDate <= twoWeeksAfter &&
//     Status.toLowerCase() === 'approved'
//   );
// };

const get_WFH_period = (request_period) => {
  if (request_period == 'FULL') {
    return 'Full Day';
  }
  if (request_period == 'AM') {
    return '9am - 1pm';
  }
  if (request_period == 'PM') {
    return '2pm - 6pm';
  }
};

const notMoreThanTwoMonthsAgo = (WFH_Date) => {
  const twoMonthsBefore = new Date();
  twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2);
  const wfhDateObj = new Date(WFH_Date);

  return wfhDateObj >= twoMonthsBefore;
};

// Modal state
const showModal = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
const modalType = ref(''); // 'alert' or 'confirm'
let modalResolve;

const sortedRequests = computed(() => {
  return [...localRequests.value].sort((a, b) => {
    return new Date(b.WFH_Date) - new Date(a.WFH_Date);
  });
});

const sortedRecurringRequests = computed(() => {
  const recurringRequests = localRequests.value.filter(
    (request) => request.Is_Recurring,
  );

  const requestsWithDates = recurringRequests.map((request) => {
    const firstRecurringDate = extractFirstRecurringDate(
      request.WFH_Date_Start,
      request.WFH_Date_End,
      request.WFH_Day,
    );
    return {
      ...request,
      firstRecurringDate,
    };
  });

  requestsWithDates.sort((a, b) => {
    const firstDateA = new Date(a.firstRecurringDate);
    const firstDateB = new Date(b.firstRecurringDate);
    return firstDateA - firstDateB;
  });

  return requestsWithDates;
});

const sortedNonRecurringRequests = computed(() => {
  return sortedRequests.value.filter((request) => !request.Is_Recurring);
});

const upcomingNonRecurringRequests = computed(() => {
  return sortedNonRecurringRequests.value.filter((request) => {
    const requestDate = new Date(request.WFH_Date);
    const currentDate = new Date();
    return requestDate >= currentDate;
  });
});

const pastNonRecurringRequests = computed(() => {
  return sortedNonRecurringRequests.value.filter((request) => {
    const requestDate = new Date(request.WFH_Date);
    const currentDate = new Date();
    return requestDate < currentDate;
  });
});

// Fetch WFH requests for the correct staff
const getWFHRequests = async (staffID) => {
  try {
    const res = await axios.get(`${API_ROUTE}/wfh-request/user`, {
      params: { staffID },
    });

    if (res.data && Array.isArray(res.data.results)) {
      // Process each request
      const processedRequests = await Promise.all(
        res.data.results
          .filter((requestObj) =>
            notMoreThanTwoMonthsAgo(requestObj['WFH_Date']),
          )
          .map(async (request) => {
            let comments = request.Comments;

            // If request was previously a withdrawal request that was rejected
            if (request.Status === 'Approved') {
              try {
                // Get withdrawal request details
                const withdrawalRes = await axios.get(
                  `${API_ROUTE}/wfh-request/withdrawal/get-request-comment-of-request-id`,
                  {
                    params: { requestID: request.Request_ID },
                  },
                );

                // If withdrawal request exists and was rejected, update comments
                if (withdrawalRes.data && withdrawalRes.data.comments) {
                  comments = `Withdrawal Request Rejection Remarks:\n${withdrawalRes.data.comments}`;
                }
              } catch (error) {
                // If no withdrawal request found, keep original comments
                console.log('No withdrawal request found for this request');
              }
            }

            return {
              Staff_ID: request.Staff_ID,
              Request_ID: request.Request_ID,
              Request_Date: formatRequestDate(request.Request_Date),
              WFH_Date: formatRequestDate(request.WFH_Date),
              Request_Period: request.Request_Period,
              Reason: request.Request_Reason,
              Status: request.Status,
              Comments: comments,
              showWithdrawButton:
                request.Status.toLowerCase() === 'approved' &&
                canWithdraw(request.WFH_Date),
              showCancelButton:
                request.Status.toLowerCase() === 'pending' &&
                canCancel(request.WFH_Date),
              Is_Recurring: false,
            };
          }),
      );

      localRequests.value = processedRequests;
    } else {
      console.warn('No valid results found in the response.');
    }
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
  }
};

function getDay(dayOfWeek) {
  const days = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
    7: 'Sun',
  };

  return days[dayOfWeek];
}

// Fetch WFH recurring requests for the correct staff
const fetchWFHRecurringRequests = async (staffID) => {
  try {
    const res = await axios.get(`${API_ROUTE}/wfh-request/staff-recurring`, {
      params: { staffID },
    });
    if (res.data?.results && Array.isArray(res.data.results)) {
      const processedRequests = res.data.results.map((request) => ({
        Staff_ID: request.Staff_ID,
        Request_ID: request.Request_ID,
        Request_Date: formatRequestDate(request.Request_Date),
        WFH_Date_Start: request.WFH_Date_Start,
        WFH_Date_End: request.WFH_Date_End,
        WFH_Day: request.WFH_Day,
        WFH_Date: `${formatRecurringRequestDate(request.WFH_Date_Start)} to ${formatRecurringRequestDate(request.WFH_Date_End)} | Every ${getDay(request.WFH_Day)}, ${get_WFH_period(request.Request_Period)}`,
        Reason: request.Request_Reason,
        Status: request.Status,
        Comments: request.Comments || '',
        Is_Recurring: true,
      }));

      localRequests.value.push(...processedRequests); // Combine with non-recurring requests
    } else {
      console.warn('No valid results found in the response.');
    }
  } catch (error) {
    console.error('Error fetching recurring WFH requests:', error);
  }
};

// Modal handling functions
const showAlert = (title, message) => {
  modalTitle.value = title;
  modalMessage.value = message;
  modalType.value = 'alert';
  showModal.value = true;
};

const showConfirm = (title, message) => {
  modalTitle.value = title;
  modalMessage.value = message;
  modalType.value = 'confirm';
  showModal.value = true;
  return new Promise((resolve) => {
    modalResolve = resolve;
  });
};

const handleModalConfirm = () => {
  showModal.value = false;
  if (modalType.value === 'confirm' && modalResolve) {
    modalResolve(true);
  }
};

const handleModalCancel = () => {
  showModal.value = false;
  if (modalType.value === 'confirm' && modalResolve) {
    modalResolve(false);
  }
};

const cancelRequest = async (requestID) => {
  try {
    const confirmed = await showConfirm(
      'Confirm Cancellation',
      'Confirm cancellation of this pending request?',
    );
    if (!confirmed) return;

    await axios.put(
      `${API_ROUTE}/wfh-request/request/status`,
      { status: 'Cancelled' },
      { params: { requestID } },
    );

    localRequests.value = localRequests.value.filter(
      (request) => request.Request_ID !== requestID,
    );

    showAlert('Success', `Request has been successfully cancelled.`);
  } catch (error) {
    console.error('Error updating WFH request', error);
    showAlert('Error', 'Failed to cancel the request.');
  }
};

const cancelRecurringRequest = async (requestID) => {
  try {
    const confirmed = await showConfirm(
      'Confirm Cancellation',
      'Confirm cancellation of this recurring request?',
    );
    if (!confirmed) return;

    await axios.put(
      `${API_ROUTE}/wfh-request/recurring-request/update-decision-date`,
      { Decision_Date: new Date().toISOString().split('T')[0] },
      { params: { requestID } },
    );

    await axios.put(
      `${API_ROUTE}/wfh-request/recurring-request/status`,
      { status: 'Cancelled' },
      { params: { requestID } },
    );

    localRequests.value = localRequests.value.filter(
      (request) => request.Request_ID !== requestID,
    );

    showAlert('Success', `Request has been successfully cancelled.`);
  } catch (error) {
    console.error('Error updating WFH request', error);
    showAlert('Error', 'Failed to cancel the request.');
  }
};

// Handle withdrawing an approved request
const router = useRouter();
const openWithdrawForm = async (Request_ID, WFH_Date, Request_Period) => {
  const confirmed = await showConfirm(
    'Confirm Withdrawal',
    'Send request to manager to approve withdrawal of this request?',
  );
  if (!confirmed) return;

  router.push({
    name: 'staff-approved-requests-withdrawal',
    params: {
      requestID: Request_ID,
      WFH_Date,
      Request_Period,
    },
  });
};

onMounted(async () => {
  try {
    if (staffID) {
      isLoading.value = true;
      await getWFHRequests(staffID);
      await fetchWFHRecurringRequests(staffID);
    } else {
      console.error('Staff ID is not available.');
    }
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
  } finally {
    isLoading.value = false;
  }
});

defineExpose({
  openWithdrawForm,
  cancelRequest,
});
</script>

<template>
  <div v-if="localRequests.length > 0">
    <BContainer fluid class="py-4">
      <BRow class="justify-content-center">
        <BCol lg="10" xl="18">
          <div v-if="isLoading" class="loader-container">
            <BSpinner label="Loading requests..." />
          </div>
          <div v-else>
            <h1 class="mb-4 text-center title-header-text">My WFH Requests</h1>

            <div class="table-responsive">
              <table
                v-if="sortedRecurringRequests.length > 0"
                class="request-table"
              >
                <thead>
                  <tr>
                    <th colspan="6" class="table-title-header">
                      Recurring Requests
                    </th>
                  </tr>
                  <tr>
                    <th>Reason for Request</th>
                    <th>WFH Date</th>
                    <th>Requested On</th>
                    <th>Status</th>
                    <th>Actions</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(request, index) in sortedRecurringRequests"
                    :key="index"
                  >
                    <td>{{ request.Reason }}</td>
                    <td>
                      {{ request.WFH_Date }}
                      {{ get_WFH_period(request.Request_Period) }}
                    </td>
                    <td>{{ request.Request_Date }}</td>

                    <td>
                      <BBadge
                        :variant="
                          {
                            Pending: 'info',
                            Withdrawn: 'secondary',
                            'Withdrawal Pending': 'warning',
                            Approved: 'success',
                            Rejected: 'danger',
                          }[request.Status]
                        "
                        pill
                      >
                        {{ request.Status }}
                      </BBadge>
                    </td>

                    <td>
                      <!-- Cancel Button -->
                      <button
                        v-if="
                          request.Status.toLowerCase() === 'pending' &&
                          !cantCancelRecurring(
                            extractAllRecurringDates(
                              request.WFH_Date_Start,
                              request.WFH_Date_End,
                              request.WFH_Day,
                            ),
                          )
                        "
                        @click="cancelRecurringRequest(request.Request_ID)"
                        class="btn btn-warning btn-sm mb-2"
                        :disabled="
                          cantCancelRecurring(
                            extractAllRecurringDates(
                              request.WFH_Date_Start,
                              request.WFH_Date_End,
                              request.WFH_Day,
                            ),
                          )
                        "
                      >
                        Cancel
                      </button>
                      <span
                        v-if="
                          request.Status.toLowerCase() === 'pending' &&
                          cantCancelRecurring(
                            extractAllRecurringDates(
                              request.WFH_Date_Start,
                              request.WFH_Date_End,
                              request.WFH_Day,
                            ),
                          )
                        "
                        class="text-danger small"
                      >
                        Can only cancel requests when you are more than 2 weeks
                        before or after requested WFH start/end date
                      </span>
                      <span
                        v-if="request.Is_Recurring == true"
                        class="text-danger small mt-2 d-block"
                      ></span>
                    </td>
                    <td>
                      <template
                        v-if="
                          request.Comments &&
                          request.Comments.startsWith(
                            'Withdrawal Request Rejection Remarks:',
                          )
                        "
                      >
                        <div class="withdrawal-remarks">
                          <strong>Withdrawal Request Rejection Remarks:</strong>
                          <br />
                          {{ request.Comments.split('\n')[1] }}
                        </div>
                      </template>
                      <template v-else>
                        {{ request.Comments }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="table-responsive">
              <table
                class="request-table"
                v-if="sortedNonRecurringRequests.length > 0"
              >
                <thead>
                  <tr>
                    <th colspan="6" class="table-title-header">
                      Non-Recurring Requests
                    </th>
                  </tr>
                  <tr>
                    <th>Reason for Request</th>
                    <th>WFH Date</th>
                    <th>Requested On</th>
                    <th>Status</th>
                    <th>Actions</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="6" class="section-header">
                      Upcoming Requests
                    </td>
                  </tr>
                  <tr v-if="upcomingNonRecurringRequests.length == 0">
                    <td
                      colspan="6"
                      class="text-center"
                      style="font-weight: bold"
                    >
                      No upcoming requests
                    </td>
                  </tr>
                  <tr
                    v-for="(request, index) in upcomingNonRecurringRequests"
                    :key="index"
                  >
                    <td>{{ request.Reason }}</td>
                    <td>
                      {{ request.WFH_Date }}
                      {{ get_WFH_period(request.Request_Period) }}
                    </td>
                    <td>{{ request.Request_Date }}</td>

                    <td>
                      <BBadge
                        :variant="
                          {
                            Pending: 'info',
                            Withdrawn: 'secondary',
                            'Withdrawal Pending': 'warning',
                            Approved: 'success',
                            Rejected: 'danger',
                          }[request.Status]
                        "
                        pill
                      >
                        {{ request.Status }}
                      </BBadge>
                    </td>

                    <td>
                      <!-- Cancel Button -->
                      <button
                        v-if="
                          request.Status.toLowerCase() === 'pending' &&
                          canCancel(request.WFH_Date)
                        "
                        @click="cancelRequest(request.Request_ID)"
                        class="btn btn-warning btn-sm mb-2"
                        :disabled="!canCancel(request.WFH_Date)"
                      >
                        Cancel
                      </button>
                      <span
                        v-if="
                          request.Status.toLowerCase() === 'pending' &&
                          !canCancel(request.WFH_Date)
                        "
                        class="text-danger small"
                      >
                        Can only cancel requests when you are more than 2 weeks
                        before or after requested WFH date
                      </span>

                      <!-- Withdraw Button -->
                      <button
                        v-if="request.showWithdrawButton"
                        @click="
                          openWithdrawForm(
                            request.Request_ID,
                            request.WFH_Date,
                            request.Request_Period,
                          )
                        "
                        class="btn btn-danger btn-sm"
                        :disabled="!canWithdraw(request.WFH_Date)"
                      >
                        Withdraw
                      </button>
                      <span
                        v-if="
                          request.Status.toLowerCase() === 'approved' &&
                          !canWithdraw(request.WFH_Date)
                        "
                        class="text-danger small mt-2 d-block"
                      >
                        Can only withdraw requests when you are more than 2
                        weeks before or after requested WFH date
                      </span>
                      <span
                        v-if="
                          request.Status.toLowerCase() === 'withdrawal pending'
                        "
                        class="text-muted small d-block mt-1"
                      >
                        Withdrawal Pending
                      </span>
                      <span
                        v-if="request.Is_Recurring == true"
                        class="text-danger small mt-2 d-block"
                      ></span>
                    </td>
                    <td>
                      <template
                        v-if="
                          request.Comments &&
                          request.Comments.startsWith(
                            'Withdrawal Request Rejection Remarks:',
                          )
                        "
                      >
                        <div class="withdrawal-remarks">
                          <strong>Withdrawal Request Rejection Remarks:</strong>
                          <br />
                          {{ request.Comments.split('\n')[1] }}
                        </div>
                      </template>
                      <template v-else>
                        {{ request.Comments }}
                      </template>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="6" class="section-header">Past Requests</td>
                  </tr>
                  <tr v-if="pastNonRecurringRequests.length == 0">
                    <td
                      colspan="6"
                      class="text-center"
                      style="font-weight: bold"
                    >
                      No past requests
                    </td>
                  </tr>
                  <tr
                    v-for="(request, index) in pastNonRecurringRequests"
                    :key="index"
                  >
                    <td>{{ request.Reason }}</td>
                    <td>
                      {{ request.WFH_Date }}
                      {{ get_WFH_period(request.Request_Period) }}
                    </td>
                    <td>{{ request.Request_Date }}</td>

                    <td>
                      <BBadge
                        :variant="
                          {
                            Pending: 'info',
                            Withdrawn: 'secondary',
                            'Withdrawal Pending': 'warning',
                            Approved: 'success',
                            Rejected: 'danger',
                          }[request.Status]
                        "
                        pill
                      >
                        {{ request.Status }}
                      </BBadge>
                    </td>

                    <td>
                      <!-- Cancel Button -->
                      <button
                        v-if="
                          request.Status.toLowerCase() === 'pending' &&
                          canCancel(request.WFH_Date)
                        "
                        @click="cancelRequest(request.Request_ID)"
                        class="btn btn-warning btn-sm mb-2"
                        :disabled="!canCancel(request.WFH_Date)"
                      >
                        Cancel
                      </button>
                      <span
                        v-if="
                          request.Status.toLowerCase() === 'pending' &&
                          !canCancel(request.WFH_Date)
                        "
                        class="text-danger small"
                      >
                        Can only cancel requests when you are more than 2 weeks
                        before or after requested WFH date
                      </span>

                      <!-- Withdraw Button -->
                      <button
                        v-if="request.showWithdrawButton"
                        @click="
                          openWithdrawForm(
                            request.Request_ID,
                            request.WFH_Date,
                            request.Request_Period,
                          )
                        "
                        class="btn btn-danger btn-sm"
                        :disabled="!canWithdraw(request.WFH_Date)"
                      >
                        Withdraw
                      </button>
                      <span
                        v-if="
                          request.Status.toLowerCase() === 'approved' &&
                          !canWithdraw(request.WFH_Date)
                        "
                        class="text-danger small mt-2 d-block"
                      >
                        Can only withdraw requests when you are more than 2
                        weeks before or after requested WFH date
                      </span>
                      <span
                        v-if="
                          request.Status.toLowerCase() === 'withdrawal pending'
                        "
                        class="text-muted small d-block mt-1"
                      >
                        Withdrawal Pending
                      </span>
                      <span
                        v-if="request.Is_Recurring == true"
                        class="text-danger small mt-2 d-block"
                      ></span>
                    </td>
                    <td>
                      <template
                        v-if="
                          request.Comments &&
                          request.Comments.startsWith(
                            'Withdrawal Request Rejection Remarks:',
                          )
                        "
                      >
                        <div class="withdrawal-remarks">
                          <strong>Withdrawal Request Rejection Remarks:</strong>
                          <br />
                          {{ request.Comments.split('\n')[1] }}
                        </div>
                      </template>
                      <template v-else>
                        {{ request.Comments }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </BCol>
      </BRow>
    </BContainer>
  </div>
  <div v-else class="no-requests">
    <p>No current requests</p>
  </div>

  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-dialog">
      <div class="modal-content">
        <div
          class="modal-header"
          :class="{
            'bg-success text-white': modalTitle === 'Success',
            'bg-danger text-white': modalTitle === 'Error',
            'bg-primary text-white': modalTitle.startsWith('Confirm'),
          }"
        >
          <h5 class="modal-title">{{ modalTitle }}</h5>
        </div>
        <div class="modal-body">
          <p>{{ modalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button
            v-if="modalType === 'confirm'"
            type="button"
            class="btn btn-secondary"
            @click="handleModalCancel"
          >
            Cancel
          </button>
          <button
            v-if="modalType === 'confirm'"
            type="button"
            class="btn btn-primary"
            @click="handleModalConfirm"
          >
            Confirm
          </button>
          <button
            v-else
            type="button"
            class="btn btn-secondary"
            @click="handleModalCancel"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-requests {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  background-color: #f8f9fa;
  color: black;
}

.no-requests p {
  font-weight: bold;
  font-size: 30px;
}

.title-header-text {
  font-size: 30px;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 20px;
}

.section-header {
  background-color: #cccccc9a;
  font-weight: bold;
  border-top: 2px solid #000;
  font-size: 20px;
}

@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    padding: 20px;
  }

  table {
    background-color: white;
    border-radius: 10px;
    margin-top: 20px;
  }
}

/* Status tag styling */
.status {
  padding: 5px 10px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
}

button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 10px;
}

button:hover {
  opacity: 0.8;
}

.withdrawal-remarks {
  color: #666;
  font-style: italic;
}

.withdrawal-remarks strong {
  color: #495057;
  display: block;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
}

.text-danger {
  margin-top: 0.5rem;
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.request-table {
  width: 100%;
  background-color: #fff;
  border-collapse: collapse;
  margin-top: 20px;
  border: 2px solid #050505;
}

.request-table th,
.request-table td {
  padding: 12px 15px;
  text-align: left;
  vertical-align: middle;
  border: 1px black;
}

.request-table th {
  background-color: #daebff; /* Header background color */
  color: #000000;
  font-weight: bold;
}

.request-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.request-table tr:hover {
  background-color: #f1f1f1;
}

table.request-table th.table-title-header {
  background-color: #c7e0f1;
  font-weight: bold;
  text-align: center;
  font-size: 25px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-dialog {
  background-color: white;
  border-radius: 5px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  text-align: right;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
}
</style>
