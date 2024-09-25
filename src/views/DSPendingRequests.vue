<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';

// Reporting Manager ID to filter employees
const reportingManagerId = 130002;

// Refs to hold the employee data and WFH requests
const employees = ref([]);
const wfhRequests = ref([]);
const combinedRequests = ref([]); // Combine all data from above
// TO DO: add refs for previouslyAccepted and previouslyRejected from the DB
// TO DO: read from these two refs, and do a v-if and v-for statement for the tables under them
// TO DO: make sure table can read MULTIPLE date and time requested by an employee

// Function to fetch all employees and filter by Reporting Manager
const fetchEmployees = async () => {
  try {
    // Define the API route (local or deployed)
    let API_ROUTE = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_API_ENDPOINT
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;

    // Fetch all employees
    const res = await axios.get(`${API_ROUTE}/employee/all`);
    console.log('Employee data: ', res.data);
    // Filter employees by Reporting Manager ID
    employees.value = res.data.results.filter(
      (employee) => employee.Reporting_Manager === reportingManagerId
    );
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
    const staffIds = employees.value.map((employee) => employee.Staff_ID);

    // Fetch all WFH Requests
    let API_ROUTE = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_API_ENDPOINT
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;

    const res = await axios.get(`${API_ROUTE}/wfh_request/all`);

    // Filter WFH requests by Staff_IDs
    wfhRequests.value = res.data.results.filter((request) =>
      staffIds.includes(request.Staff_ID)
    );

    // Join employees to WFH requests based on Staff_ID
    joinEmployeesToWFHRequests();
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
  }
};

// Function to join employees data to WFH requests
const joinEmployeesToWFHRequests = () => {
  combinedRequests.value = wfhRequests.value.map((request) => {
    // Find the corresponding employee based on Staff_ID
    const employee = employees.value.find(
      (emp) => emp.Staff_ID === request.Staff_ID
    );

    // Merge employee details into the WFH request
    return {
      ...request, // Include all properties of the WFH request
      ...employee, // Include all properties of the matching employee
    };
  });

  console.log('Combined WFH Requests with Employee Data:', combinedRequests.value);
};

function formatRequestDate(isoDate) {
  // Create a Date object from the ISO string, parsed as UTC
  const date = new Date(isoDate);

  // Extract the day, month, year, and weekday
  const day = date.getUTCDate(); // Use getUTCDate to avoid local time adjustments
  const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  const weekday = date.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });

  // Combine into the desired format: Month Day, Year (Weekday)
  const formattedDate = `${month} ${day}, ${year} (${weekday})`;

  return formattedDate;
}

// Call both functions when the component is mounted
onMounted(async () => {
  await fetchEmployees(); // Fetch employees first
  await fetchWFHRequests(); // Then fetch WFH requests based on employees
});
</script>

<template>
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
      <div class="action-table" v-if="employees.length === 0">
        <p>No employees found for this manager.</p>
      </div>
      <div class="action-table" v-else>
        <table class="table">
          <tbody>
            <tr v-for="request in combinedRequests" :key="request.Request_ID">
              <td class="col-2">{{request.Staff_FName}} {{request.Staff_LName}}</td>
              <td class="col-3">{{request.Reason}}</td>
              <td class="col-2">{{formatRequestDate(request.Request_Date)}}</td>
              <td class="col-2">{{formatRequestDate(request.Request_Date)}}</td>
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
      <div class="action-table" v-if="employees.length === 0">
        <p>No employees found for this manager.</p>
      </div>
      <div class="request-table" v-else>
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
