<script setup>
import axios from 'axios';
import { inject, ref, onMounted } from 'vue';

const reportingManagerId = 130002; // Hardcoded Reporting Manager ID

const employees = ref([]);
const wfhRequests = ref([]);
const pendingRequests = ref([]);
const acceptedRequests = ref([]);
const rejectedRequests = ref([]);

const API_ROUTE = inject('API_ROUTE');

const fetchEmployees = async () => {
  try {
    const res = await axios.get(`${API_ROUTE}/employee/all`);
    employees.value = res.data.results.filter(
      (employee) => employee.Reporting_Manager === reportingManagerId,
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

    const res = await axios.get(`${API_ROUTE}/wfh-request/all`);

    wfhRequests.value = res.data.results.filter((request) => staffIds.includes(request.Staff_ID));

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
    const employee = employees.value.find((emp) => emp.Staff_ID === request.Staff_ID);

    const combinedRequest = {
      ...request,
      ...employee,
      Request_Date: formatRequestDate(request.Request_Date),
      Approval_Date: formatRequestDate(request.Approval_Date),
    };

    switch (combinedRequest.Status) {
      case 'Pending':
        pendingRequests.value.push(combinedRequest);
        break;
      case 'Withdrawn':
      case 'Approved':
        acceptedRequests.value.push(combinedRequest);
        break;
      case 'Rejected':
        rejectedRequests.value.push(combinedRequest);
        break;
      default:
        break;
    }
  });
};

const formatRequestDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = date.getUTCDate();
  const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  const weekday = date.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });
  const formattedDate = `${month} ${day}, ${year} (${weekday})`;

  return formattedDate;
};

const updateRequestStatus = async (requestID, newStatus, rejectionReason = null) => {
  try {
    if (newStatus === 'Approved') {
      await checkWFHPolicy(reportingManagerId);
    }
    if (rejectionReason !== null && rejectionReason !== '') {
      await axios.put(
        `${API_ROUTE}/wfh-request/request/updateApprovalComments`,
        { comments: rejectionReason },
        { params: { requestID } },
      );
    }
    await axios.put(
      `${API_ROUTE}/wfh-request/request/status`,
      { status: newStatus },
      { params: { requestID } },
    );
    await fetchWFHRequests();
  } catch (error) {
    console.error('Error updating request status:', error);
  }
};

const checkWFHPolicy = async (reportingManagerID) => {
  try {
    const staffIDs = await axios.get(`${API_ROUTE}/employee/get-staff-under-reporting-manager`, {
      params: { reportingManagerID: reportingManagerID }
    });
    const approvedRequests = await axios.get(`${API_ROUTE}/wfh_request/get-approved-requests-by-approver-id`, {
      params: { approverID: reportingManagerID }
    });
    if (staffIDs.length * 0.5 < approvedRequests.length + 1) {
      alert('Accepting this request will violate the 50% WFH policy.');
    }
  } catch (error) {
    console.error('Error fetching staff under reporting manager:', error);
  }
};

onMounted(async () => {
  await fetchEmployees();
  await fetchWFHRequests();
});
</script>

<template>
  <div class="container">
    <h2>Pending Requests of my Direct Subordinates</h2>

    <RequestLinks @linkChange="setActiveLink" />

    <RequestTable v-if="isActive('/incoming-requests')" :requests="pendingRequests" status="pending"
      @updateRequestStatus="updateRequestStatus" />
    <RequestTable v-if="isActive('/previously-accepted')" :requests="acceptedRequests" status="accepted"
      @updateRequestStatus="updateRequestStatus" />
    <RequestTable v-if="isActive('/previously-rejected')" :requests="rejectedRequests" status="rejected" />
  </div>
</template>

<script>
export default {
  name: 'PendingRequests',
  data() {
    return {
      activeLink: '/incoming-requests',
    };
  },
  methods: {
    isActive(link) {
      return this.activeLink === link;
    },
    setActiveLink(link) {
      this.activeLink = link;
    },
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  font-size: 1.5em;
  color: #343a40;
}
</style>
