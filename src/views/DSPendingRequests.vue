<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';

// Reporting Manager ID to filter employees
const reportingManagerId = 130002;

// Refs to hold the employee data and WFH requests
const employees = ref([]);
const wfhRequests = ref([]);

// Function to fetch all employees and filter by Reporting Manager
const fetchEmployees = async () => {
  try {
    // Define the API route (local or deployed)
    let API_ROUTE = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_API_ENDPOINT
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;

    // Fetch all employees
    const res = await axios.get(`${API_ROUTE}/employee/all`);

    // Filter employees by Reporting Manager ID
    employees.value = res.data.results.filter(employee => employee.Reporting_Manager === reportingManagerId);

  } catch (error) {
    console.error('Error fetching employees:', error);
  }
};

// Function to fetch all WFH Requests and filter by Staff_IDs
const fetchWFHRequests = async () => {
  try {
    // Ensure there are employees before fetching WFH requests
    if (employees.value.length === 0) {
      console.error('No employees found for the reporting manager.');
      return;
    }

    // Extract Staff_IDs of the employees
    const staffIds = employees.value.map(employee => employee.Staff_ID);

    // Fetch all WFH Requests
    let API_ROUTE = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_API_ENDPOINT
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;

    const res = await axios.get(`${API_ROUTE}/wfh_request/all`);

    // Filter WFH requests by Staff_IDs
    wfhRequests.value = res.data.results.filter(request => staffIds.includes(request.Staff_ID));

  } catch (error) {
    console.error('Error fetching WFH requests:', error);
  }
};

// Call both functions when the component is mounted
onMounted(async () => {
  await fetchEmployees(); // Fetch employees first
  await fetchWFHRequests(); // Then fetch WFH requests based on employees
});
</script>

<template>
  <!-- TO DELETE -->
  <br>
  <div>
    <h2>WFH Requests for Employees managed by Reporting Manager 130002</h2>
    <div v-if="employees.length === 0">
      <p>No employees found for this manager.</p>
    </div>
    <div v-else>
      <h3>Employees</h3>
      <ul>
        <li v-for="employee in employees" :key="employee.Staff_ID">
          {{ employee.Name }} (ID: {{ employee.Staff_ID }})
        </li>
      </ul>
    </div>

    <div v-if="wfhRequests.length === 0">
      <p>No WFH requests found.</p>
    </div>
    <div v-else>
      <h3>WFH Requests</h3>
      <ul>
        <li v-for="request in wfhRequests" :key="request.Request_ID">
          {{ request.Staff_ID }} - WFH on {{ request.WFH_Date }}
        </li>
      </ul>
    </div>
  </div>

  <!-- my codes -->
  <div class="container">
    <h2 class="header">Pending Requests of my Direct Subordinates</h2>

    <!-- Incoming Requests / Previously Accepted / Previously Rejected -->
    <div class="links">
      <div class="link-container">
        <router-link
          to="/pending-requests"
          class="link"
          :class="{ active: isActive('/incoming-requests') }"
          @click.prevent="setActiveLink('/incoming-requests')"
        >
          Incoming Requests
        </router-link>
      </div>

      <div class="link-container">
        <router-link
          to="/pending-requests"
          class="link"
          :class="{ active: isActive('/previously-accepted') }"
          @click.prevent="setActiveLink('/previously-accepted')"
        >
          Previously Accepted
        </router-link>
      </div>

      <div class="link-container">
        <router-link
          to="/pending-requests"
          class="link"
          :class="{ active: isActive('/previously-rejected') }"
          @click.prevent="setActiveLink('/previously-rejected')"
        >
          Previously Rejected
        </router-link>
      </div>
    </div>

    <!-- When "Incoming Requests" is active -->
    <div id="pendingrequests" v-if="isActive('/incoming-requests')">
      <div class="request-table">
        <table class="table">
          <thead>
            <tr>
              <th class="col-2">Name</th>
              <th class="col-3">Reason for Request</th>
              <th class="col-2">WFH Date</th>
              <th class="col-2">Requested On</th>
              <th class="col-3"></th>
            </tr>
          </thead>
        </table>
      </div>

      <div class="action-table">
        <table class="table">
          <tbody>
            <tr>
              <td class="col-2">Derek Tan</td>
              <td class="col-3">Will be returning from work trip late in the same morning</td>
              <td class="col-2">23/9/2024</td>
              <td class="col-2">19/9/2024</td>
              <td class="col-3 text-nowrap d-flex justify-content-between">
                <button class="btn btn-success">Accept</button>
                <button class="btn btn-danger">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- When "Previously Accepted" is active -->
    <div id="previouslyaccepted" v-if="isActive('/previously-accepted')">
      <div class="request-table">
        <table class="table">
          <thead>
            <tr>
              <th class="col-2">Name</th>
              <th class="col-3">Reason for Request</th>
              <th class="col-1">WFH Date</th>
              <th class="col-2">Requested On</th>
              <th class="col-2">Accepted On</th>
              <th class="col-2"></th>
            </tr>
          </thead>
        </table>
      </div>

      <div class="action-table">
        <table class="table">
          <tbody>
            <tr>
              <td class="col-2">Derek Tan</td>
              <td class="col-3">Will be returning from work trip late in the same morning</td>
              <td class="col-1">23/9/2024</td>
              <td class="col-2">19/9/2024</td>
              <td class="col-2">19/9/2024</td>
              <td class="col-2">
                <button class="btn btn-success">Withdraw</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- When "Previously Rejected" is active -->
    <div id="previouslyrejected" v-if="isActive('/previously-rejected')">
      <div class="request-table">
        <table class="table">
          <thead>
            <tr>
              <th class="col-2">Name</th>
              <th class="col-3">Reason for Request</th>
              <th class="col-1">WFH Date</th>
              <th class="col-2">Requested On</th>
              <th class="col-2">Rejected On</th>
              <th class="col-2">Reason</th>
            </tr>
          </thead>
        </table>
      </div>

      <div class="action-table">
        <table class="table">
          <tbody>
            <tr>
              <td class="col-2">Derek Tan</td>
              <td class="col-3">Will be returning from work trip late in the same morning</td>
              <td class="col-1">23/9/2024</td>
              <td class="col-2">19/9/2024</td>
              <td class="col-2">19/9/2024</td>
              <td class="col-2">Rejected as high-stake client meeting for that day.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PendingRequests',
  data() {
    return {
      activeLink: '/incoming-requests', // Default active link
    };
  },
  methods: {
    isActive(link) {
      return this.activeLink === link;
    },
    setActiveLink(link) {
      this.activeLink = link;
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  height: 100vh; /* Full height */
  width: 100vw; /* Full width */
  box-sizing: border-box; /* Include padding in height/width */
  background-color: #F3F3F3; /* Background color */
}

.header {
  text-align: left;
  margin-bottom: 20px;
}

/* Links and their container styles */
.links {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px solid #0D6FE5; /* Single line across all links */
  padding-bottom: 5px;
}

.link-container {
  text-align: center;
  flex: 1;
}

.link {
  text-decoration: none;
  color: black;
  font-size: 20px;
  padding: 10px 0; /* Ensure padding for clickable area */
}

.link.active {
  font-weight: bold;
  border-bottom: 2px solid #0D6FE5; /* Highlight active link */
}

/* Styles for the rounded rectangle with shadow */
.request-table {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 40px;
}

.request-table table {
  width: 100%;
  border-collapse: collapse;
}

.request-table th,
.request-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}

/* Styles for the action table */
.action-table {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
}

.action-table table {
  width: 100%;
  border-collapse: collapse;
}

.action-table td {
  padding: 10px;
  text-align: left;
}

.btn {
  margin-right: 5px; /* Spacing between buttons */
}
</style>
