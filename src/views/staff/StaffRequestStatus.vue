<script setup>
import axios from 'axios';
import { inject, onMounted, ref, watch } from 'vue';
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

const API_ROUTE = inject('API_ROUTE', 'http://localhost:3000');

const formatRequestDate = (isoDate) => {
  const date = new Date(isoDate);
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

const isWithinTwoWeeks = (WFH_Date, Status) => {
  const currentDate = new Date();
  const twoWeeksBefore = new Date(WFH_Date);
  twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
  const twoWeeksAfter = new Date(WFH_Date);
  twoWeeksAfter.setDate(twoWeeksAfter.getDate() + 14);

  return (
    currentDate >= twoWeeksBefore &&
    currentDate <= twoWeeksAfter &&
    Status.toLowerCase() === 'approved'
  );
};

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

// Fetch WFH requests for the correct staff
const getWFHRequests = async (staffID) => {
  try {
    const res = await axios.get(`${API_ROUTE}/wfh-request/user`, {
      params: { staffID },
    });

    if (res.data && Array.isArray(res.data.results)) {
      localRequests.value = res.data.results
        .filter((requestObj) => notMoreThanTwoMonthsAgo(requestObj['WFH_Date']))
        .map((request) => ({
          Staff_ID: request.Staff_ID,
          Request_ID: request.Request_ID,
          Request_Date: formatRequestDate(request.Request_Date),
          WFH_Date: formatRequestDate(request.WFH_Date),
          Request_Period: request.Request_Period,
          Reason: request.Request_Reason,
          Status: request.Status,
          Comments: request.Comments,
          showWithdrawButton: isWithinTwoWeeks(
            new Date(request.WFH_Date),
            request.Status,
          ),
        }));
    } else {
      console.warn('No valid results found in the response.');
    }
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
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

    showAlert('Success', `${requestID} has been successfully cancelled.`);
  } catch (error) {
    console.error('Error cancelling WFH request:', error);
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
  } else {
    console.error('Staff ID is not available.');
  }
});
</script>

<template>
  <BContainer>
    <BRow>
      <BCol>
        <h1>All Requests</h1>

        <table class="table">
          <thead>
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
            <tr v-for="(request, index) in localRequests" :key="index">
              <td class="col-2">{{ request.Reason }}</td>
              <td class="col-2">
                {{
                  request.WFH_Date +
                  ', ' +
                  get_WFH_period(request.Request_Period)
                }}
              </td>
              <td class="col-2">{{ request.Request_Date }}</td>

              <td class="col-2">
                <BBadge
                  :variant="
                    {
                      Pending: 'info',
                      Withdrawn: 'secondary',
                      'Withdrawal Pending': 'light',
                      Approved: 'success',
                      Rejected: 'danger',
                    }[request.Status]
                  "
                  pill
                >
                  {{ request.Status }}
                </BBadge>
              </td>

              <td class="col-2">
                <button
                  v-if="request.Status.toLowerCase() === 'pending'"
                  @click="cancelRequest(request.Request_ID)"
                  class="btn btn-warning"
                >
                  Cancel
                </button>
                <button
                  v-if="request.showWithdrawButton"
                  @click="
                    openWithdrawForm(
                      request.Request_ID,
                      request.WFH_Date,
                      request.Request_Period,
                    )
                  "
                  class="btn btn-danger"
                >
                  Withdraw
                </button>
                <span
                  v-if="request.Status.toLowerCase() === 'withdrawal pending'"
                  class="text-muted"
                  >Withdrawal Pending</span
                >
              </td>
              <td class="col-2">{{ request.Comments }}</td>
            </tr>
          </tbody>
        </table>
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
            @click="showModal = false"
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
</style>
