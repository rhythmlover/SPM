<script setup>
import axios from 'axios';
import { inject, onMounted, ref } from 'vue';
// import { withdrawRequest } from './ApprovedRequestWithdrawal.vue';

const requests = ref([]);
const API_ROUTE = inject('API_ROUTE');

const isWithinTwoWeeks = (WFH_Date, Status) => {
  const currentDate = new Date();
  const twoWeeksBefore = new Date(WFH_Date);
  twoWeeksBefore.setDate(twoWeeksBefore.getDate() - 14);
  const twoWeeksAfter = new Date(WFH_Date);
  twoWeeksAfter.setDate(twoWeeksAfter.getDate() + 14);

  return (currentDate >= twoWeeksBefore || currentDate <= twoWeeksAfter) && (Status.toLowerCase() === 'approved');
};

// Fetch WFH requests for the correct staff
const getWFHRequests = async (staffID) => {
  try {
    const res = await axios.get(`${API_ROUTE}/wfh-request/user`, {
      params: { staffID },
    });

    if (res.data && Array.isArray(res.data.results)) {
      requests.value = res.data.results.map((request) => ({
        StaffID: request.Staff_ID,
        Request_ID: request.Request_ID,
        Request_Date: new Date(request.Request_Date).toLocaleDateString('en-CA'),
        WFH_Date: new Date(request.WFH_Date).toLocaleDateString('en-CA'),
        Request_Period: request.Request_Period,
        Reason: request.Request_Reason,
        Status: request.Status,
        showWithdrawButton: isWithinTwoWeeks(new Date(request.WFH_Date), request.Status)
      }));
    } else {
      console.warn('No valid results found in the response.');
      requests.value = [];
    }
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
  }
};

// Delete a specific request with confirmation and alert
const deleteRequest = async (requestID) => {
  try {
    const confirmDelete = window.confirm(
      'Confirm deletion of this pending request?',
    );

    if (!confirmDelete) {
      return; // Do nothing if user cancels
    }

    let API_ROUTE = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_API_ENDPOINT
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;

    await axios.delete(`${API_ROUTE}/wfh-request/request/delete/id`, {
      params: { requestID },
    });

    // Remove the deleted request from the requests array
    requests.value = requests.value.filter(
      (request) => request.Request_ID !== requestID,
    );

    // Alert the user after successful deletion
    window.alert(`Request with ID ${requestID} has been successfully deleted.`);
  } catch (error) {
    console.error('Error deleting WFH request:', error);
  }
};

const openWithdrawForm = (requestID, WFH_Date) => {
  const confirmWithdraw = window.confirm('Send request to manager to approve withdrawal of this request?');

  if (!confirmWithdraw) {
    return; // Do nothing if user cancels
  }

  // Call the function to withdraw the request
  withdrawRequest(requestID, WFH_Date);
  // userStore.dispatch('withdrawRequest', { requestID, WFH_Date });
};

// Use onMounted to fetch data when the component is mounted
onMounted(async () => {
  // Hardcoded staffID for now after removing userstore, implement after local storage
  const staffID = 171015; // Safely access Staff_ID
  if (staffID) {
    await getWFHRequests(staffID); // Pass the staffID to the function
  } else {
    console.error('Staff ID is not available.');
  }
});
</script>

<template>
  <BContainer :style="{ marginTop: '100px' }">
    <BRow>
      <BCol>
        <h1>All Requests</h1>

        <table class="table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Request ID</th>
              <th>Application Date</th>
              <th>WFH Date</th>
              <th>Request Period</th>
              <th>Request Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(request, index) in requests" :key="index">
              <td>{{ request.StaffID }}</td>
              <td>{{ request.Request_ID }}</td>
              <td>{{ request.Request_Date }}</td>
              <td>{{ request.WFH_Date }}</td>
              <td>{{ request.Request_Period }}</td>
              <td>{{ request.Reason }}</td>
              <td>{{ request.Status }}</td>
              <td>
                <!-- Conditionally show Delete button if status is 'Pending' or 'pending' -->
                <button v-if="request.Status.toLowerCase() === 'pending'" @click="deleteRequest(request.Request_ID)"
                  class="btn btn-warning">
                  Withdraw
                </button>
                <button v-if="request.showWithdrawButton" @click="openWithdrawForm(request.WFH_Date)"
                  class="btn btn-danger">
                  Withdraw
                </button>
              </td>
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
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    table-layout: fixed;
  }
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border: 1px solid #ddd;
  word-wrap: break-word;
}

th {
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

.btn-danger:hover {
  background-color: #c82333;
}
</style>
