<script setup>
import axios from 'axios';
import { inject, ref, onMounted } from 'vue';

const reportingManagerId = 130002;  // Hardcoded Reporting Manager ID

const employees = ref([]);
const wfhRequests = ref([]);
const pendingRequests = ref([]);
const acceptedRequests = ref([]);
const rejectedRequests = ref([]);

const API_ROUTE = inject('API_ROUTE');

const fetchEmployees = async () => {
  try {
    const res = await axios.get(`${API_ROUTE}/employee/all`);
    console.log('Employee data: ', res.data);
    employees.value = res.data.results.filter(
      (employee) => employee.Reporting_Manager === reportingManagerId
    );
  } catch (error) {
    console.error('Error fetching employees:', error);
  }
};

const fetchWFHRequests = async () => {
  try {
    if (employees.value.length === 0) {
      console.error('No employees found for the reporting manager.');
      return;
    }

    const staffIds = employees.value.map((employee) => employee.Staff_ID);

    const res = await axios.get(`${API_ROUTE}/wfh_request/all`);

    wfhRequests.value = res.data.results.filter((request) =>
      staffIds.includes(request.Staff_ID)
    );

    joinEmployeesToWFHRequests();
  } catch (error) {
    console.error('Error fetching sWFH requests:', error);
  }
};

const joinEmployeesToWFHRequests = () => {
  pendingRequests.value = [];
  acceptedRequests.value = [];
  rejectedRequests.value = [];
  
  wfhRequests.value.forEach((request) => {
    const employee = employees.value.find(
      (emp) => emp.Staff_ID === request.Staff_ID
    );

    const combinedRequest = {
      ...request,
      ...employee,
    };

    switch (combinedRequest.Status) {
      case "Pending":
        pendingRequests.value.push(combinedRequest);
        break;
      case "Withdrawn":
      case "Approved":
        acceptedRequests.value.push(combinedRequest);
        break;
      case "Rejected":
        rejectedRequests.value.push(combinedRequest);
        break;
      default:
        break;
    }
  });

  console.log('Pending Requests:', pendingRequests.value);
  console.log('Accepted Requests:', acceptedRequests.value);
  console.log('Rejected Requests:', rejectedRequests.value);
};

// Function to fetch WFH dates and append them to requests
const fetchWFHDates = async () => {
  try {
    const res = await axios.get(`${API_ROUTE}/wfh_request/wfh-dates`);

    // Log the raw WFH dates received
    console.log('WFH Dates Data:', res.data.results);

    const wfhDates = res.data.results;

    // Append WFH dates to pending, accepted, and rejected requests
    appendWFHDatesToRequests(pendingRequests, wfhDates);
    appendWFHDatesToRequests(acceptedRequests, wfhDates);
    appendWFHDatesToRequests(rejectedRequests, wfhDates);

    // Log the updated requests after appending
    console.log('Pending Requests After Update:', pendingRequests.value);
    console.log('Accepted Requests After Update:', acceptedRequests.value);
    console.log('Rejected Requests After Update:', rejectedRequests.value);
  } catch (error) {
    console.error('Error fetching WFH dates:', error);
  }
};

// Function to append WFH dates to requests
const appendWFHDatesToRequests = (requestsRef, wfhDates) => {
  if (!requestsRef.value || requestsRef.value.length === 0) {
    console.warn('No requests to append WFH dates to.');
    return;
  }

  requestsRef.value.forEach(request => {
    // Find the matched date for the current request
    const matchedDate = wfhDates.find(date => date.Request_ID === request.Request_ID);

    // If a match is found, append WFH_Date and WFH_Time as separate properties
    if (matchedDate) {
      request.WFH_Date = formatRequestDate(matchedDate.WFH_Date); // Format WFH_Date
      request.WFH_Time = matchedDate.WFH_Time; // Keep WFH_Time as is

      // Log the updated request with WFH_Date and WFH_Time appended
      console.log(`Updated request for Request_ID ${request.Request_ID}:`, request);
    }
  });

  // Log the updated requests to verify the changes
  console.log(`Updated requests in ${requestsRef} ref:`, requestsRef.value);
};

// Function to format dates
const formatRequestDate = (isoDate) => {
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

const updateRequestStatus = async (requestID, newStatus) => {
  try {
    const response = await axios.put(`${API_ROUTE}/wfh_request/request/status`,
      { status: newStatus },
      { params: { requestID } }
    );
    console.log('Response:', response.data);
    await fetchWFHRequests();
  } catch (error) {
    console.error('Error updating request status:', error);
  }
};

const checkWFHPolicy = async (reportingManagerID) => {
  try {
    const staffIDs = await axios.get(`${API_ROUTE}/employee/getStaffUnderReportingManager`, {
      params: { reportingManagerID: reportingManagerID }
    });
    const approvedRequests = await axios.get(`${API_ROUTE}/wfh_request/getApprovedRequestsByApproverID`, {
      params: { approverID: reportingManagerID }
    });
    if (staffIDs.length * 0.5 < approvedRequests.length + 1) {
      alert("Accepting this request will violate the 50% WFH policy.");
    }
  }
  catch (error) {
    console.error('Error fetching staff under reporting manager:', error);
  }
};

onMounted(async () => {
  await fetchEmployees();
  await fetchWFHRequests();
  await fetchWFHDates();
});
</script>

<template>
  <div class="container">
    <h2 class="header">Pending Requests of my Direct Subordinates</h2>

    <!-- Incoming Requests / Previously Accepted / Previously Rejected -->
    <div class="links">
      <div class="link-container">
        <router-link to="/pending-requests" class="link" :class="{ active: isActive('/incoming-requests') }"
          @click.prevent="setActiveLink('/incoming-requests')">
          Incoming Requests
        </router-link>
      </div>

      <div class="link-container">
        <router-link to="/pending-requests" class="link" :class="{ active: isActive('/previously-accepted') }"
          @click.prevent="setActiveLink('/previously-accepted')">
          Previously Accepted
        </router-link>
      </div>

      <div class="link-container">
        <router-link to="/pending-requests" class="link" :class="{ active: isActive('/previously-rejected') }"
          @click.prevent="setActiveLink('/previously-rejected')">
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
      <div class="action-table" v-if="pendingRequests.length === 0">
        <p>No pending WFH requests.</p>
      </div>
      <div class="action-table" v-else>
        <table class="table">
          <tbody>
            <tr v-for="request in pendingRequests" :key="request.Request_ID">
              <td class="col-2">{{ request.Staff_FName }} {{ request.Staff_LName }}</td>
              <td class="col-3">{{ request.Reason }}</td>
              <td class="col-2">{{ request.WFH_Date }}</td>
              <td class="col-2">{{ formatRequestDate(request.Request_Date) }}</td>
              <td class="col-3 text-nowrap d-flex justify-content-between">
                <button class="btn btn-success"
                  @click="updateRequestStatus(request.Request_ID, 'Approved')">Accept</button>
                <button class="btn btn-danger"
                  @click="updateRequestStatus(request.Request_ID, 'Rejected')">Reject</button>
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
              <th class="col-2">Reason for Request</th>
              <th class="col-2">WFH Date</th>
              <th class="col-2">Requested On</th>
              <th class="col-2">Accepted On</th>
              <th class="col-2"></th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="action-table" v-if="acceptedRequests.length === 0">
        <p>No previously accepted WFH requests.</p>
      </div>
      <div class="action-table" v-else>
        <table class="table">
          <tbody>
            <tr v-for="request in acceptedRequests" :key="request.Request_ID">
              <td class="col-2">{{ request.Staff_FName }} {{ request.Staff_LName }}</td>
              <td class="col-2">{{ request.Reason }}</td>
              <td class="col-2">{{ request.WFH_Date }}</td>
              <td class="col-2">{{ formatRequestDate(request.Request_Date) }}</td>
              <td class="col-2">19/9/2024</td>
              <td class="col-2">
                <button v-if="request.Status === 'Withdrawn'" class="btn btn-success"
                  @click="updateRequestStatus(request.Request_ID, 'Withdrawn')">Withdraw</button>
                <button v-if="request.Status === 'Approved'" class="btn btn-outline-success" disabled>Withdraw</button>
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
              <th class="col-2">Reason for Request</th>
              <th class="col-2">WFH Date</th>
              <th class="col-2">Requested On</th>
              <th class="col-2">Rejected On</th>
              <th class="col-2">Reason</th>
            </tr>
          </thead>
        </table>
      </div>
      <div class="action-table" v-if="rejectedRequests.length === 0">
        <p>No previously rejected WFH requests.</p>
      </div>
      <div class="action-table">
        <table class="table">
          <tbody>
            <tr v-for="request in rejectedRequests" :key="request.Request_ID">
              <td class="col-2">{{ request.Staff_FName }} {{ request.Staff_LName }}</td>
              <td class="col-2">{{ request.Reason }}</td>
              <td class="col-2">{{ request.WFH_Date }}</td>
              <td class="col-2">{{ formatRequestDate(request.Request_Date) }}</td>
              <td class="col-2">19/9/2024</td>
              <td class="col-2">{{ request.Comments }}</td>
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
  height: 100vh;
  /* Full height */
  width: 100vw;
  /* Full width */
  box-sizing: border-box;
  /* Include padding in height/width */
  background-color: #F3F3F3;
  /* Background color */
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
  border-bottom: 1px solid #0D6FE5;
  /* Single line across all links */
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
  padding: 10px 0;
  /* Ensure padding for clickable area */
}

.link.active {
  font-weight: bold;
  border-bottom: 2px solid #0D6FE5;
  /* Highlight active link */
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
  margin-right: 5px;
  /* Spacing between buttons */
}
</style>
