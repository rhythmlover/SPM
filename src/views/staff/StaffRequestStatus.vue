<script setup>
import axios from 'axios';
import { inject, onMounted, ref } from 'vue';

const requests = ref([]);
const API_ROUTE = inject('API_ROUTE');

// Fetch WFH requests for the correct staff
const getWFHRequests = async (staffID) => {
  try {
    const res = await axios.get(`${API_ROUTE}/wfh_request/user`, { params: { staffID } });

    if (res.data && Array.isArray(res.data.results)) {
      requests.value = res.data.results.map(request => ({
        StaffID: request.Staff_ID,
        Request_ID: request.Request_ID,
        Request_Date: new Date(request.Request_Date).toLocaleDateString('en-CA'),
        Request_Period: request.Request_Period,
        Reason: request.Reason,
        Status: request.Status,
      }));
    } else {
      console.warn("No valid results found in the response.");
      requests.value = [];
    }
  } catch (error) {
    console.error("Error fetching WFH requests:", error);
  }
};

// Delete a specific request with confirmation and alert
const deleteRequest = async (requestID) => {
  try {
    const confirmDelete = window.confirm("Confirm deletion of this pending request?");
    
    if (!confirmDelete) {
      return; // Do nothing if user cancels
    }

    let API_ROUTE = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_API_ENDPOINT
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;

    await axios.delete(`${API_ROUTE}/wfh_request/request/delete/id`,
      { params: { requestID } }
    );
    
    // Remove the deleted request from the requests array
    requests.value = requests.value.filter(request => request.Request_ID !== requestID);

    // Alert the user after successful deletion
    window.alert(`Request with ID ${requestID} has been successfully deleted.`);
  } catch (error) {
    console.error("Error deleting WFH request:", error);
  }
};

// Use onMounted to fetch data when the component is mounted
onMounted(async () => {
  await getWFHRequests(171015);
});
</script>

<template>
  <BContainer>
    <BRow>
      <BCol>
        <h1 class="centered-heading">All Requests</h1>
        <table class="table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Request ID</th>
              <th>Request Date</th>
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

.table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border: 1px solid #ddd;
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

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.btn-danger:hover {
  background-color: #c82333;
}
</style>

