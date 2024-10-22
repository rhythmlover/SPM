<script setup>
import axios from 'axios';
import { inject, ref, onMounted } from 'vue';

const employees = ref([]);
const wfhRequests = ref([]);
const wfhRecurringRequests = ref([]);
const pendingRequests = ref([]);
const acceptedRequests = ref([]);
const rejectedRequests = ref([]);
const staffID = inject('staffID');

const API_ROUTE = inject('API_ROUTE');

const fetchEmployees = async () => {
  try {
    const res = await axios.get(`${API_ROUTE}/employee/all`);
    employees.value = res.data.results.filter(
      (employee) => employee.Reporting_Manager === staffID.value,
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

    // Fetch non-recurring WFH requests
    const res = await axios.get(`${API_ROUTE}/wfh-request/all`);
    wfhRequests.value = res.data.results.filter((request) =>
      staffIds.includes(request.Staff_ID),
    );

    // Fetch recurring WFH requests
    const recurringRes = await axios.get(
      `${API_ROUTE}/wfh-request/ds-recurring`,
      {
        params: { staffID: staffID.value },
      },
    );

    wfhRecurringRequests.value = recurringRes.data.results.filter((request) =>
      staffIds.includes(request.Staff_ID),
    );

    // Now join both requests to employees
    joinEmployeesToWFHRequests();
    joinEmployeesToWFHRecurringRequests();

    // Output combined pending requests
    console.log('OUTPUTS: ', pendingRequests);
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
  }
};

const checkExpiredRequests = async () => {
  try {
    if (pendingRequests.value.length !== 0) {
      await axios.put(`${API_ROUTE}/wfh-request/removeExpiredRequests`);
      console.log('Successfully updated status');
    }
  } catch (error) {
    console.error(
      'Error updating expired pending requests to rejected:',
      error,
    );
  }
};

const joinEmployeesToWFHRequests = () => {
  pendingRequests.value = []; // Clear array first to combine new results
  acceptedRequests.value = [];
  rejectedRequests.value = [];

  wfhRequests.value.forEach((request) => {
    const employee = employees.value.find(
      (emp) => emp.Staff_ID === request.Staff_ID,
    );

    const combinedRequest = {
      ...request,
      ...employee,
      Request_Date: formatRequestDate(request.Request_Date),
      Decision_Date: formatRequestDate(request.Decision_Date),
      WFH_Date: formatRequestDate(request.WFH_Date),
    };

    switch (combinedRequest.Status) {
      case 'Pending':
      case 'Withdrawal Pending':
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
        // Handle any other cases if necessary
        break;
    }
  });
};

const joinEmployeesToWFHRecurringRequests = () => {
  wfhRecurringRequests.value.forEach((recurringRequest) => {
    const employee = employees.value.find(
      (emp) => emp.Staff_ID === recurringRequest.Staff_ID,
    );

    const combinedRequest = {
      ...recurringRequest,
      ...employee,
      Request_Date: formatRequestDate(recurringRequest.Request_Date),
      Decision_Date: formatRequestDate(recurringRequest.Decision_Date),
      WFH_Date_Start: formatRequestDate(recurringRequest.WFH_Date_Start),
      WFH_Date_End: formatRequestDate(recurringRequest.WFH_Date_End),
    };

    if (combinedRequest.Status === 'Pending') {
      pendingRequests.value.push(combinedRequest);
    }
  });
  console.log('PENDING REQUESTS: ', pendingRequests);
  // After both functions run, check for expired requests
  checkExpiredRequests();
};

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
  const formattedDate = `${month} ${day}, ${year} (${weekday})`;

  return formattedDate;
};

const updateRequestStatus = async (
  requestID,
  newStatus,
  commentsAdded = null,
) => {
  try {
    if (newStatus === 'Approved') {
      await checkWFHPolicy(staffID.value);
    }
    if (commentsAdded !== null && commentsAdded !== '') {
      await axios.put(
        `${API_ROUTE}/wfh-request/request/updateComments`,
        { comments: commentsAdded },
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

const updateWithdrawalStatus = async (
  requestID,
  newStatus,
  commentsAdded = null,
) => {
  try {
    // if withdrawal is rejected, check if policy allows
    if (newStatus === 'Approved') {
      await checkWFHPolicy(staffID.value);
    }
    if (commentsAdded !== null && commentsAdded !== '') {
      await axios.put(
        `${API_ROUTE}/wfh-request/withdrawal/updateComments`,
        { comments: commentsAdded },
        { params: { requestID } },
      );
    }
    await axios.put(
      `${API_ROUTE}/wfh-request/withdrawal/status`,
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
    const staffIDs = await axios.get(
      `${API_ROUTE}/employee/get-staff-under-reporting-manager`,
      {
        params: { reportingManagerID: reportingManagerID },
      },
    );
    const approvedRequests = await axios.get(
      `${API_ROUTE}/wfh_request/get-approved-requests-by-approver-id`,
      {
        params: { approverID: reportingManagerID },
      },
    );
    if (staffIDs.data.length * 0.5 < approvedRequests.data.length + 1) {
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
  <BContainer>
    <h2>Requests from My Direct Subordinates</h2>

    <RequestLinks @linkChange="setActiveLink" />

    <RequestTable
      v-if="isActive('/incoming-requests')"
      :requests="pendingRequests"
      status="pending"
      @updateRequestStatus="updateRequestStatus"
      @updateWithdrawalStatus="updateWithdrawalStatus"
    />
    <RequestTable
      v-if="isActive('/previously-accepted')"
      :requests="acceptedRequests"
      status="accepted"
      @updateRequestStatus="updateRequestStatus"
      @updateWithdrawalStatus="updateWithdrawalStatus"
    />
    <RequestTable
      v-if="isActive('/previously-rejected')"
      :requests="rejectedRequests"
      status="rejected"
    />
  </BContainer>
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
