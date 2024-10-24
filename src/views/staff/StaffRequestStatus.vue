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

// Delete a specific request
const deleteRequest = async (requestID) => {
  try {
    const confirmDelete = window.confirm(
      'Confirm deletion of this pending request?',
    );
    if (!confirmDelete) return;

    await axios.delete(`${API_ROUTE}/wfh-request/request/delete/id`, {
      params: { requestID },
    });

    localRequests.value = localRequests.value.filter(
      (request) => request.Request_ID !== requestID,
    );
    window.alert(`Request with ID ${requestID} has been successfully deleted.`);
  } catch (error) {
    console.error('Error deleting WFH request:', error);
  }
};

// Handle withdrawing an approved request
const router = useRouter();
const openWithdrawForm = (Request_ID, WFH_Date, Request_Period) => {
  const confirmWithdraw = window.confirm(
    'Send request to manager to approve withdrawal of this request?',
  );
  if (!confirmWithdraw) return;

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
              <td class="col-2" v-if="request.Status == 'Pending'">
                <BBadge pill variant="info">Pending</BBadge>
              </td>
              <td class="col-2" v-if="request.Status == 'Withdrawn'">
                <BBadge pill variant="secondary">Withdrawn</BBadge>
              </td>
              <td class="col-2" v-if="request.Status == 'Withdrawal Pending'">
                <BBadge pill variant="light">Withdrawn</BBadge>
              </td>
              <td class="col-2" v-if="request.Status == 'Approved'">
                <BBadge pill variant="success">Approved</BBadge>
              </td>
              <td class="col-2" v-if="request.Status == 'Rejected'">
                <BBadge pill variant="danger">Rejected</BBadge>
              </td>
              <td class="col-2">
                <!-- Conditionally show Delete button if status is 'Pending' or 'pending' -->
                <button
                  v-if="request.Status.toLowerCase() === 'pending'"
                  @click="deleteRequest(request.Request_ID)"
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
</style>
