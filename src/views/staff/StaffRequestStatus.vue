<script setup>
import axios from 'axios';
import { inject, onMounted, ref } from 'vue';
import { useUserStore } from '@/stores/user';

const requests = ref([]);
const API_ROUTE = inject('API_ROUTE');
const userStore = useUserStore();

// Fetch WFH requests for the correct staff
const getWFHRequests = async (staffID) => {
  try {
    const res = await axios.get(`${API_ROUTE}/wfh-request/user`, { params: { staffID } });

    if (res.data && Array.isArray(res.data.results)) {
      requests.value = res.data.results.map((request) => ({
        StaffID: request.Staff_ID,
        Request_ID: request.Request_ID,
        Request_Date: new Date(request.Request_Date).toLocaleDateString('en-CA'),
        Request_Period: request.Request_Period,
        Reason: request.Reason,
        Status: request.Status,
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
    const confirmDelete = window.confirm('Confirm deletion of this pending request?');

    if (!confirmDelete) {
      return; // Do nothing if user cancels
    }

    let API_ROUTE = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_API_ENDPOINT
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;

    await axios.delete(`${API_ROUTE}/wfh-request/request/delete/id`, { params: { requestID } });

    // Remove the deleted request from the requests array
    requests.value = requests.value.filter((request) => request.Request_ID !== requestID);

    // Alert the user after successful deletion
    window.alert(`Request with ID ${requestID} has been successfully deleted.`);
  } catch (error) {
    console.error('Error deleting WFH request:', error);
  }
};

// Use onMounted to fetch data when the component is mounted
onMounted(async () => {
  const staffID = userStore.userInfo?.Staff_ID; // Safely access Staff_ID
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
              <th>Request Date</th>
              <th>Request Period</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(request, index) in requests" :key="index">
              <td>{{ request.StaffID }}</td>
              <td>{{ request.Request_ID }}</td>
              <td>{{ request.Request_Date }}</td>
              <td>{{ request.Request_Period }}</td>
              <td>{{ request.Reason }}</td>
              <td>{{ request.Status }}</td>
              <td>
                <!-- Conditionally show Delete button if status is 'Pending' or 'pending' -->
                <button
                  v-if="request.Status.toLowerCase() === 'pending'"
                  @click="deleteRequest(request.Request_ID)"
                  class="btn btn-danger"
                >
                  Delete
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

/* Approved status tag */
.approved {
  background-color: #4caf50; /* Green */
}

/* Pending status tag */
.pending {
  background-color: #ffc107; /* Yellow */
}

/* Rejected status tag */
.rejected {
  background-color: #f44336; /* Red */
}
</style>
