<script setup>
import axios from 'axios';
import { inject, ref, onMounted, watch } from 'vue';

const employees = ref([]);
const wfhRequests = ref([]);
const wfhRecurringRequests = ref([]);
const pendingRequests = ref([]);
const acceptedRequests = ref([]);
const rejectedRequests = ref([]);
const loading = ref(true);
const staffID = inject('staffID');

const API_ROUTE = inject('API_ROUTE');

// Modal state
const showPolicyModal = ref(false);
const modalMessage = ref('');
let proceedCallback = null;

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
    loading.value = true;
    if (employees.value.length === 0) {
      console.error('No employees found for the reporting manager.');
      loading.value = false;
      return;
    }

    const staffIds = employees.value.map((employee) => employee.Staff_ID);

    // Fetch non-recurring WFH requests
    const res = await axios.get(`${API_ROUTE}/wfh-request/ds-non-recurring`);
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

    pendingRequests.value = [];
    acceptedRequests.value = [];
    rejectedRequests.value = [];

    // Now join both requests to employees
    await joinEmployeesToWFHRequests();
    joinEmployeesToWFHRecurringRequests();
    loading.value = false;

    // Output combined pending requests
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
    loading.value = false;
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
};

const formatRequestDate = (isoDate) => {
  const date = new Date(isoDate);
  // Adjust for timezone offset
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
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
      const policyViolated = await checkWFHPolicy(
        staffID.value,
        wfhDate,
        requestPeriod,
      );
      if (policyViolated) {
        modalMessage.value =
          'Accepting this request will violate the 50% WFH policy.';
        showPolicyModal.value = true;
        await new Promise((resolve) => {
          proceedCallback = resolve;
        });
      }
    }

    if (proceedCallback) proceedCallback();

    if (commentsAdded) {
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

const cancelPolicyViolation = () => {
  showPolicyModal.value = false;
  proceedCallback && proceedCallback();
  proceedCallback = null;
};

const proceedPolicyViolation = () => {
  showPolicyModal.value = false;
  proceedCallback && proceedCallback();
  proceedCallback = null;
};

const updateRecurringRequestStatus = async (
  requestID,
  newStatus,
  commentsAdded = null,
) => {
  try {
    if (newStatus === 'Approved') {
      const result = await axios.get(
        `${API_ROUTE}/wfh-request/recurring-request/dates`,
        {
          params: { requestID },
        },
      );
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

      const datesWithViolation = [];

      for (const date of wfhDates) {
        const policyViolated = await checkWFHPolicy(
          staffID.value,
          date,
          requestPeriod,
        );
        if (policyViolated) {
          datesWithViolation.push(date);
        }
      }

      if (datesWithViolation.length > 0) {
        modalMessage.value = `Accepting this request will violate the 50% WFH policy for the following dates: ${datesWithViolation.join(
          ', ',
        )}.`;
        showPolicyModal.value = true;
        await new Promise((resolve) => {
          proceedCallback = resolve;
        });
      }

      for (const date of wfhDates) {
        let dateObj = new Date(date);
        dateObj.setDate(dateObj.getDate() + 1);
        const dateInsert = dateObj.toISOString().split('T')[0];
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

    const wfhDate = wfhDatePeriod.data.data.WFH_Date.split('T')[0];
    const requestPeriod = wfhDatePeriod.data.data.Request_Period;

    // Check the policy before rejecting the withdrawal
    if (newStatus === 'Rejected') {
      const policyViolated = await checkWFHPolicy(
        staffID.value,
        wfhDate,
        requestPeriod,
      );
      if (policyViolated) {
        modalMessage.value =
          'Rejecting this withdrawal will violate the 50% WFH policy.';
        showPolicyModal.value = true;
        await new Promise((resolve) => {
          const unwatch = watch(showPolicyModal, (val) => {
            if (!val) {
              unwatch();
              resolve();
            }
          });
        });
      }
    }

    // Proceed to update the withdrawal status
    if (commentsAdded) {
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
    console.error('Error updating withdrawal status:', error);
  }
};

const checkWFHPolicy = async (reportingManagerID, wfhDate, requestPeriod) => {
  try {
    const staffResponse = await axios.get(
      `${API_ROUTE}/employee/get-staff-under-reporting-manager`,
      {
        params: { reportingManagerID },
      },
    );
    const staffIDs = staffResponse.data.results.map((emp) => emp.Staff_ID);
    const staffTotal = staffIDs.length + 1;

    // Get all approved requests for the same date
    const approvedRequestsResponse = await axios.get(
      `${API_ROUTE}/wfh-request/ds-non-recurring`,
    );

    // Filter approved requests of staff under this manager for the given date
    const approvedRequests = approvedRequestsResponse.data.results.filter(
      (request) =>
        staffIDs.includes(request.Staff_ID) &&
        request.WFH_Date.split('T')[0] === wfhDate &&
        request.Status === 'Approved',
    );

    // Count the number of staff who will be WFH on that date, including the current request
    let approvedRequestsAM = approvedRequests.filter(
      (request) =>
        request.Request_Period === 'AM' || request.Request_Period === 'FULL',
    ).length;
    let approvedRequestsPM = approvedRequests.filter(
      (request) =>
        request.Request_Period === 'PM' || request.Request_Period === 'FULL',
    ).length;

    // Include the current request
    if (requestPeriod === 'AM' || requestPeriod === 'FULL') {
      approvedRequestsAM += 1;
    }
    if (requestPeriod === 'PM' || requestPeriod === 'FULL') {
      approvedRequestsPM += 1;
    }

    // Check if WFH staff would exceed 50% of total staff
    if (
      approvedRequestsAM + 1 > Math.floor(staffTotal / 2) ||
      approvedRequestsPM + 1 > Math.floor(staffTotal / 2)
    ) {
      return true; // Policy would be violated
    } else {
      return false; // Policy not violated
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
};

onMounted(async () => {
  await fetchEmployees();
  await fetchWFHRequests();
});
</script>

<template>
  <BContainer>
    <h2 style="text-align: center; font-weight: bold; margin: 20px">
      Requests from My Direct Subordinates
    </h2>

    <RequestLinks @linkChange="setActiveLink" />

    <div v-if="loading" class="loader-container">
      <BSpinner label="Loading..." />
    </div>
    <div v-else>
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
    </div>
  </BContainer>
  <BModal v-model="showPolicyModal" title="Policy Violation">
    <p>{{ modalMessage }}</p>
    <template #footer>
      <BButton variant="primary" @click="cancelPolicyViolation">Cancel</BButton>
      <BButton variant="danger" @click="proceedPolicyViolation"
        >Proceed</BButton
      >
    </template>
  </BModal>
</template>

<style scoped>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-dialog {
  background-color: white;
  border-radius: 5px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  text-align: right;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
}
</style>

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
