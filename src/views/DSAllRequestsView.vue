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

const fetchWithdrawalReason = async (request_ID) => {
  try {
    const res = await axios.get(
      `${API_ROUTE}/wfh-request/withdrawal/get-request-reason-of-request-id`,
      { params: { requestID: request_ID } },
    );
    return res.data.request_reason || null;
  } catch (error) {
    console.error(
      `Error fetching withdrawal reason for request ID ${request_ID}:`,
      error,
    );
    return null;
  }
};

const joinEmployeesToWFHRequests = async () => {
  pendingRequests.value = [];
  acceptedRequests.value = [];
  rejectedRequests.value = [];
  for (const request of wfhRequests.value) {
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

    if (combinedRequest.Status === 'Withdrawal Pending') {
      const withdrawalReason = await fetchWithdrawalReason(request.Request_ID);
      combinedRequest.Request_Reason = withdrawalReason;
    }

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
        break;
    }
  }
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
    const wfhDatePeriod = await axios.get(
      `${API_ROUTE}/wfh-request/request/get-wfh-date-period-by-request-id`,
      { params: { requestID } },
    );

    const wfhDate = wfhDatePeriod.data.data.WFH_Date.split('T')[0];
    const requestPeriod = wfhDatePeriod.data.data.Request_Period;

    if (newStatus === 'Approved') {
      await checkWFHPolicy(staffID.value, wfhDate, requestPeriod);
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

const updateRecurringRequestStatus = async (
  requestID,
  newStatus,
  commentsAdded = null,
) => {
  try {
    if (newStatus === 'Approved') {
      console.log(requestID);
      const result = await axios.get(
        `${API_ROUTE}/wfh-request/recurring-request/dates`,
        {
          params: { requestID },
        },
      );
      console.log('RESULT: ', result);
      const wfhDateStart = result.data.WFH_Date_Start;
      const wfhDateEnd = result.data.WFH_Date_End;
      const wfhDay = result.data.WFH_Day;
      const requestPeriod = result.data.Request_Period;

      const wfhDates = [];
      let currentDate = new Date(wfhDateStart);

      while (currentDate <= new Date(wfhDateEnd)) {
        if (currentDate.getDay() === parseInt(wfhDay)) {
          wfhDates.push(currentDate.toISOString().split('T')[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const requestDetails = await axios.get(
        `${API_ROUTE}/wfh-request/recurring-request/get-request-details`,
        { params: { requestID } },
      );

      let requestDate = requestDetails.data.Request_Date.split('T')[0];
      let requestDateObj = new Date(requestDate);
      requestDateObj.setDate(requestDateObj.getDate() + 1);
      requestDate = requestDateObj.toISOString().split('T')[0];
      const requestReason = requestDetails.data.Request_Reason;
      const requestStaffID = requestDetails.data.Staff_ID;

      for (const date of wfhDates) {
        let dateObj = new Date(date);
        dateObj.setDate(dateObj.getDate() + 1);
        const dateInsert = dateObj.toISOString().split('T')[0];
        await checkWFHPolicy(staffID, date, requestPeriod);
        const results = await axios.post(
          `${API_ROUTE}/wfh-request/recurring-request/insert-approved-recurring-dates`,
          {
            Staff_ID: requestStaffID,
            Request_Date: requestDate,
            Request_Period: requestPeriod,
            Request_Reason: requestReason,
            Approver_ID: staffID.value,
            Comments: commentsAdded ? commentsAdded : '',
            Decision_Date: new Date().toISOString().split('T')[0],
            WFH_Date: dateInsert,
            Recurring_Request_ID: requestID,
          },
        );
        console.log('RESULTS: ', results);
      }
    }

    if (commentsAdded !== null && commentsAdded !== '') {
      await axios.put(
        `${API_ROUTE}/wfh-request/recurring-request/update-comments`,
        { comments: commentsAdded },
        { params: { requestID } },
      );
    }

    await axios.put(
      `${API_ROUTE}/wfh-request/recurring-request/update-decision-date`,
      { Decision_Date: new Date().toISOString().split('T')[0] },
      { params: { requestID } },
    );

    await axios.put(
      `${API_ROUTE}/wfh-request/recurring-request/status`,
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
    const wfhDatePeriod = await axios.get(
      `${API_ROUTE}/wfh-request/request/get-wfh-date-period-by-request-id`,
      { params: { requestID } },
    );
    console.log('WFH DATE PERIOD 2: ', wfhDatePeriod);
    const wfhDate = wfhDatePeriod.data.data.WFH_Date;
    const requestPeriod = wfhDatePeriod.data.data.Request_Period;

    // if withdrawal is rejected, check if policy allows
    if (newStatus === 'Approved') {
      await checkWFHPolicy(staffID.value, wfhDate, requestPeriod);
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

const checkWFHPolicy = async (reportingManagerID, wfhDate, requestPeriod) => {
  try {
    const staffIDs = await axios.get(
      `${API_ROUTE}/employee/get-staff-under-reporting-manager`,
      {
        params: { reportingManagerID },
      },
    );

    if (requestPeriod === 'AM' || requestPeriod === 'PM') {
      const approvedRequests = await axios.get(
        `${API_ROUTE}/wfh-request/request/get-approved-requests-by-approver-id-and-wfh-date-period`,
        {
          params: {
            Approver_ID: reportingManagerID,
            WFH_Date: wfhDate,
            Request_Period: requestPeriod,
          },
        },
      );
      const approvedRequestsFull = await axios.get(
        `${API_ROUTE}/wfh-request/request/get-approved-requests-by-approver-id-and-wfh-date-period`,
        {
          params: {
            Approver_ID: reportingManagerID,
            WFH_Date: wfhDate,
            Request_Period: 'FULL',
          },
        },
      );
      const approvedRequestsTotal =
        approvedRequests.data.length + approvedRequestsFull.data.length + 1;
      if (staffIDs.data.length * 0.5 < approvedRequestsTotal) {
        alert('Accepting this request will violate the 50% WFH policy.');
      }
    } else {
      const approvedRequestsFull = await axios.get(
        `${API_ROUTE}/wfh-request/request/get-approved-requests-by-approver-id-and-wfh-date-period`,
        {
          params: {
            Approver_ID: reportingManagerID,
            WFH_Date: wfhDate,
            Request_Period: 'FULL',
          },
        },
      );
      const approvedRequestsAM = await axios.get(
        `${API_ROUTE}/wfh-request/request/get-approved-requests-by-approver-id-and-wfh-date-period`,
        {
          params: {
            Approver_ID: reportingManagerID,
            WFH_Date: wfhDate,
            Request_Period: 'AM',
          },
        },
      );
      const approvedRequestsPM = await axios.get(
        `${API_ROUTE}/wfh-request/request/get-approved-requests-by-approver-id-and-wfh-date-period`,
        {
          params: {
            Approver_ID: reportingManagerID,
            WFH_Date: wfhDate,
            Request_Period: 'PM',
          },
        },
      );
      const approvedRequestsTotalAM =
        approvedRequestsAM.data.length + approvedRequestsFull.data.length + 1;
      const approvedRequestsTotalPM =
        approvedRequestsPM.data.length + approvedRequestsFull.data.length + 1;
      if (
        staffIDs.data.length * 0.5 < approvedRequestsTotalAM ||
        staffIDs.data.length * 0.5 < approvedRequestsTotalPM
      ) {
        alert('Accepting this request will violate the 50% WFH policy.');
      }
    }
  } catch (error) {
    console.error('Error fetching dates:', error);
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
      @updateRecurringRequestStatus="updateRecurringRequestStatus"
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
