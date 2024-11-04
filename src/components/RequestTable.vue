<template>
  <BContainer :style="{ marginTop: '20px' }">
    <div class="request-table">
      <div v-if="isLoading">
        <BSpinner label="Loading requests..." />
      </div>
      <div v-else>
        <table class="table">
          <thead>
            <tr v-if="status === 'pending' || status === 'withdrawal pending'">
              <th class="col-1">Name</th>
              <th class="col-2">Reason for Request</th>
              <th class="col-2">WFH Date</th>
              <th class="col-2">Requested On</th>
              <th class="col-2">Request Type</th>
              <th class="col-2">Actions</th>
            </tr>
            <tr v-if="status === 'accepted'">
              <th class="col-2">Name</th>
              <th class="col-2">Reason for Request</th>
              <th class="col-2">WFH Date</th>
              <th class="col-2">Requested On</th>
              <th class="col-2">Approved On</th>
              <th class="col-2">Actions</th>
            </tr>
            <tr v-if="status === 'rejected'">
              <th class="col-2">Name</th>
              <th class="col-2">Reason for Request</th>
              <th class="col-2">WFH Date</th>
              <th class="col-2">Requested On</th>
              <th class="col-2">Rejected On</th>
              <th class="col-2">Comments</th>
            </tr>
          </thead>
          <tbody v-if="status === 'pending'">
            <!-- Withdrawal Requests -->
            <tr>
              <td colspan="6" class="section-header">Withdrawal Requests</td>
            </tr>
            <tr
              v-for="request in sortedWithdrawalRequests"
              :key="request.Request_ID"
            >
              <td class="col-2">
                {{ request.Staff_FName }} {{ request.Staff_LName }}
              </td>
              <td class="col-2">{{ request.Request_Reason }}</td>
              <td class="col-2">
                {{
                  request.WFH_Date +
                  ', ' +
                  get_WFH_period(request.Request_Period)
                }}
              </td>
              <td class="col-2">{{ request.Request_Date }}</td>
              <td class="col-2">
                <BBadge pill variant="warning">Withdrawal</BBadge>
              </td>
              <td class="col-2">
                <template v-if="!isRejecting[request.Request_ID]">
                  <StatusButton
                    @click="
                      updateStatus(
                        request.Request_ID,
                        'Withdrawal Pending',
                        'Withdrawn',
                      )
                    "
                    label="Accept"
                    class="accept-withdrawal-btn"
                  />
                  <StatusButton
                    @click="startRejection(request.Request_ID)"
                    label="Reject"
                    class="reject-btn"
                  />
                </template>
                <template v-else>
                  <textarea
                    v-model="rejectionReason[request.Request_ID]"
                    placeholder="Enter rejection reason"
                    rows="2"
                  ></textarea>
                  <div class="reject-buttons">
                    <StatusButton
                      @click="
                        submitRejection(request.Request_ID, request.Status)
                      "
                      label="Submit"
                      class="reject-submit-btn"
                    />
                    <StatusButton
                      @click="cancelRejection(request.Request_ID)"
                      label="Cancel"
                      class="reject-cancel-btn"
                    />
                  </div>
                </template>
              </td>
            </tr>

            <!-- Non-Recurring Requests -->
            <tr>
              <td colspan="6" class="section-header">Non-Recurring Requests</td>
            </tr>
            <tr
              v-for="request in sortedNonRecurringRequests"
              :key="request.Request_ID"
            >
              <td class="col-2">
                {{ request.Staff_FName }} {{ request.Staff_LName }}
              </td>
              <td class="col-2">{{ request.Request_Reason }}</td>
              <td class="col-2">
                {{
                  formatDateTimezone(request.WFH_Date) +
                  ', ' +
                  get_WFH_period(request.Request_Period)
                }}
              </td>
              <td class="col-2">{{ request.Request_Date }}</td>
              <td class="col-2">
                <BBadge pill variant="info">New Request</BBadge>
              </td>
              <td class="col-2">
                <template v-if="!isRejecting[request.Request_ID]">
                  <StatusButton
                    v-if="request.Status == 'Pending'"
                    @click="
                      updateStatus(request.Request_ID, 'Pending', 'Approved')
                    "
                    label="Accept"
                    class="accept-btn"
                  />
                  <StatusButton
                    @click="startRejection(request.Request_ID)"
                    label="Reject"
                    class="reject-btn"
                  />
                </template>
                <template v-else>
                  <textarea
                    v-model="rejectionReason[request.Request_ID]"
                    placeholder="Enter rejection reason"
                    rows="2"
                  ></textarea>
                  <div class="reject-buttons">
                    <StatusButton
                      @click="
                        submitRejection(request.Request_ID, request.Status)
                      "
                      label="Submit"
                      class="reject-submit-btn"
                    />
                    <StatusButton
                      @click="cancelRejection(request.Request_ID)"
                      label="Cancel"
                      class="reject-cancel-btn"
                    />
                  </div>
                </template>
              </td>
            </tr>

            <!-- Recurring Requests -->
            <tr>
              <td colspan="6" class="section-header">Recurring Requests</td>
            </tr>
            <tr
              v-for="request in sortedRecurringRequests"
              :key="request.Request_ID"
            >
              <td class="col-2">
                {{ request.Staff_FName }} {{ request.Staff_LName }}
              </td>
              <td class="col-2">{{ request.Request_Reason }}</td>
              <td class="col-2">
                {{
                  formatDateTimezone(request.WFH_Date_Start) +
                  ' to ' +
                  formatDateTimezone(request.WFH_Date_End) +
                  ' | ' +
                  'Every ' +
                  getDay(request.WFH_Day) +
                  ', ' +
                  get_WFH_period(request.Request_Period)
                }}
              </td>
              <td class="col-2">{{ request.Request_Date }}</td>
              <td class="col-2">
                <BBadge pill variant="info">New Recurring Request</BBadge>
              </td>
              <td class="col-2">
                <template v-if="!isRejecting[request.Request_ID]">
                  <StatusButton
                    v-if="request.Status == 'Pending'"
                    @click="
                      updateRecurringStatus(
                        request.Request_ID,
                        'Pending',
                        'Approved',
                      )
                    "
                    label="Accept"
                    class="accept-btn"
                  />
                  <StatusButton
                    @click="startRejection(request.Request_ID)"
                    label="Reject"
                    class="reject-btn"
                  />
                </template>
                <template v-else>
                  <textarea
                    v-model="rejectionReason[request.Request_ID]"
                    placeholder="Enter rejection reason"
                    rows="2"
                  ></textarea>
                  <div class="reject-buttons">
                    <StatusButton
                      @click="
                        submitRecurringRejection(
                          request.Request_ID,
                          request.Status,
                        )
                      "
                      label="Submit"
                      class="reject-submit-btn"
                    />
                    <StatusButton
                      @click="cancelRejection(request.Request_ID)"
                      label="Cancel"
                      class="reject-cancel-btn"
                    />
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="status === 'accepted'">
            <tr v-for="request in requests" :key="request.Request_ID">
              <td class="col-2">
                {{ request.Staff_FName }} {{ request.Staff_LName }}
              </td>
              <td class="col-2">{{ request.Request_Reason }}</td>
              <td class="col-2">
                {{
                  request.WFH_Date +
                  ', ' +
                  get_WFH_period(request.Request_Period)
                }}
              </td>
              <td class="col-2">{{ request.Request_Date }}</td>
              <td class="col-2">{{ request.Decision_Date }}</td>
              <td class="col-2" v-if="request.Status == 'Approved'">
                <template v-if="!isWithdrawing[request.Request_ID]">
                  <StatusButton
                    @click="startWithdrawal(request.Request_ID)"
                    label="Withdraw"
                    class="withdraw-btn"
                  />
                </template>
                <template v-else>
                  <textarea
                    v-model="withdrawalReason[request.Request_ID]"
                    placeholder="Enter withdrawal reason"
                    rows="2"
                  ></textarea>
                  <div class="withdraw-buttons">
                    <StatusButton
                      @click="submitWithdrawal(request.Request_ID)"
                      label="Submit"
                      class="withdraw-submit-btn"
                    />
                    <StatusButton
                      @click="cancelWithdrawal(request.Request_ID)"
                      label="Cancel"
                      class="withdraw-cancel-btn"
                    />
                  </div>
                </template>
              </td>
              <td class="col-2" v-if="request.Status == 'Withdrawn'">
                <button type="button" class="btn btn-outline-success" disabled>
                  Already Withdrawn
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-if="status === 'rejected'">
            <tr v-for="request in requests" :key="request.Request_ID">
              <td class="col-2">
                {{ request.Staff_FName }} {{ request.Staff_LName }}
              </td>
              <td class="col-2">{{ request.Request_Reason }}</td>
              <td class="col-2">
                {{
                  request.WFH_Date +
                  ', ' +
                  get_WFH_period(request.Request_Period)
                }}
              </td>
              <td class="col-2">{{ request.Request_Date }}</td>
              <td class="col-2">{{ request.Decision_Date }}</td>
              <td class="col-2">{{ request.Comments }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </BContainer>
</template>

<script>
import StatusButton from './StatusButton.vue';
import { BSpinner, BBadge, BContainer, BTable } from 'bootstrap-vue-next';

export default {
  name: 'RequestTable',
  props: {
    requests: Array,
    status: String,
  },
  components: { StatusButton, BSpinner, BBadge, BContainer, BTable },
  data() {
    return {
      isRejecting: {},
      rejectionReason: {},
      isWithdrawing: {},
      withdrawalReason: {},
      isLoading: false,
    };
  },
  emits: [
    'updateRequestStatus',
    'updateRecurringRequestStatus',
    'updateWithdrawalStatus',
  ],
  methods: {
    startRejection(requestID) {
      this.isRejecting[requestID] = true;
    },
    startWithdrawal(requestID) {
      this.isWithdrawing[requestID] = true;
    },
    cancelRejection(requestID) {
      this.isRejecting[requestID] = false;
      this.rejectionReason[requestID] = '';
    },
    cancelWithdrawal(requestID) {
      this.isWithdrawing[requestID] = false;
      this.withdrawalReason[requestID] = '';
    },
    submitRejection(requestID, status) {
      if (!this.rejectionReason[requestID]?.trim()) {
        alert('Rejection reason is required');
        return;
      }
      this.isLoading = true;
      if (status == 'Pending') {
        this.$emit(
          'updateRequestStatus',
          requestID,
          'Rejected',
          this.rejectionReason[requestID],
        );
      }
      if (status == 'Withdrawal Pending') {
        this.$emit(
          'updateRequestStatus',
          requestID,
          'Approved',
          this.rejectionReason[requestID],
        );
        this.$emit(
          'updateWithdrawalStatus',
          requestID,
          'Rejected',
          this.rejectionReason[requestID],
        );
      }

      this.cancelRejection(requestID);
      this.isLoading = false;
    },
    submitRecurringRejection(requestID, status) {
      if (!this.rejectionReason[requestID]?.trim()) {
        alert('Rejection reason is required');
        return;
      }
      this.isLoading = true;
      if (status == 'Pending') {
        this.$emit(
          'updateRecurringRequestStatus',
          requestID,
          'Rejected',
          this.rejectionReason[requestID],
        );
      }
      this.cancelRejection(requestID);
      this.isLoading = false;
    },
    submitWithdrawal(requestID) {
      if (!this.withdrawalReason[requestID]?.trim()) {
        alert('Withdrawal reason is required');
        return;
      }
      this.isLoading = true;
      this.$emit(
        'updateRequestStatus',
        requestID,
        'Withdrawn',
        this.withdrawalReason[requestID],
      );
      this.cancelWithdrawal(requestID);
      this.isLoading = false;
    },
    updateStatus(requestID, requestType, newStatus) {
      this.isLoading = true;
      const validStatuses = ['Approved', 'Rejected', 'Withdrawn'];
      if (validStatuses.includes(newStatus)) {
        if (requestType == 'Withdrawal Pending') {
          this.$emit('updateWithdrawalStatus', requestID, newStatus);
          this.$emit('updateRequestStatus', requestID, newStatus);
        } else {
          this.$emit('updateRequestStatus', requestID, newStatus);
        }
      } else {
        console.error(`Invalid status: ${newStatus}`);
      }
      this.isLoading = false;
    },
    updateRecurringStatus(requestID, requestType, newStatus) {
      this.isLoading = true;
      const validStatuses = ['Approved', 'Rejected', 'Withdrawn'];
      if (validStatuses.includes(newStatus)) {
        this.$emit('updateRecurringRequestStatus', requestID, newStatus);
      } else {
        console.error(`Invalid status: ${newStatus}`);
      }
      this.isLoading = false;
    },
    get_WFH_period(request_period) {
      if (request_period == 'FULL') {
        return 'Full Day';
      }
      if (request_period == 'AM') {
        return '9am - 1pm';
      }
      if (request_period == 'PM') {
        return '2pm - 6pm';
      }
    },
    formatDateTimezone(date) {
      const formattedDate = new Date(date);
      // Adjust for timezone offset
      formattedDate.setMinutes(
        formattedDate.getMinutes() - formattedDate.getTimezoneOffset(),
      );
      return formattedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
    getDay(dayOfWeek) {
      const days = {
        1: 'Mon',
        2: 'Tue',
        3: 'Wed',
        4: 'Thu',
        5: 'Fri',
        6: 'Sat',
        7: 'Sun',
      };

      return days[dayOfWeek];
    },
  },
  computed: {
    sortedRecurringRequests() {
      return this.requests
        .filter((request) => request.WFH_Date_Start)
        .sort(
          (a, b) => new Date(a.WFH_Date_Start) - new Date(b.WFH_Date_Start),
        );
    },
    sortedNonRecurringRequests() {
      return this.requests
        .filter(
          (request) =>
            !request.WFH_Date_Start && request.Status !== 'Withdrawal Pending',
        )
        .sort((a, b) => new Date(a.WFH_Date) - new Date(b.WFH_Date));
    },
    sortedWithdrawalRequests() {
      return this.requests
        .filter((request) => request.Status === 'Withdrawal Pending')
        .sort((a, b) => new Date(a.WFH_Date) - new Date(b.WFH_Date));
    },
  },
};
</script>

<style scoped>
.request-table {
  background-color: white;
  border-radius: 10px;
  margin-top: 20px;
}

.request-table th,
.request-table td {
  padding: 12px 15px;
  text-align: left;
  vertical-align: middle;
  border: 1px solid #ddd;
}

.request-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.request-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.request-table tr:hover {
  background-color: #f1f1f1;
}

textarea {
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  border-radius: 5px;
  border: 1px solid #ced4da;
}

.section-header {
  background-color: #f4f4f4;
  font-weight: bold;
  text-align: left;
  border-top: 2px solid #000;
}
</style>
