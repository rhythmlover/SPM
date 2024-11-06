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
        WFH_Date: `${formatRecurringRequestDate(request.WFH_Date_Start)} to ${formatRecurringRequestDate(request.WFH_Date_End)} | Every ${getDay(request.WFH_Day)}, ${get_WFH_period(request.Request_Period)}`,
        Reason: request.Request_Reason,
        Status: request.Status,
        Comments: request.Comments || '',
        Is_Recurring: true,
      }));

      localRequests.value.push(...processedRequests); // Combine with non-recurring requests
      console.log('RESULTS: ', localRequests);
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
  if (staffID) {
    await getWFHRequests(staffID);
    await fetchWFHRecurringRequests(staffID);
  } else {
    console.error('Staff ID is not available.');
  }
});

defineExpose({
  openWithdrawForm,
  cancelRequest,
});
</script>

<template>
  <BContainer fluid class="py-4">
    <BRow class="justify-content-center">
      <BCol lg="10" xl="8">
        <h1 class="mb-4 text-center">My WFH Requests</h1>

        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead class="thead-dark">
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
              <tr v-for="(request, index) in sortedRequests" :key="index">
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
                      !canCancel(request.WFH_Date) &&
                      request.Is_Recurring == false
                    "
                    class="text-danger small"
                  >
                    Can only cancel requests when you are more than 2 weeks
                    before or after requested date
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
                    Can only withdraw requests when you are more than 2 weeks
                    before or after requested date
                  </span>
                  <span
                    v-if="request.Status.toLowerCase() === 'withdrawal pending'"
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
      </BCol>
    </BRow>
  </BContainer>

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
.centered-heading {
  text-align: center;
  margin-top: 20px;
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

th,
td {
  padding: 12px 15px;
  text-align: left;
  vertical-align: middle;
  border: 1px solid #ddd;
  white-space: pre-line;
}

table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
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

/* Modal styles */
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
}

.modal-content {
  border: none;
  border-radius: 5px;
  overflow: hidden;
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

.text-danger {
  margin-top: 0.5rem;
}
</style>
