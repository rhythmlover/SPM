<template>
  <BContainer :style="{ marginTop: '20px' }">
    <div class="request-table">
      <table class="table">
        <thead>
          <tr v-if="status === 'pending' || status === 'withdrawal pending'">
            <th class="col-2">Name</th>
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
          <tr v-for="request in requests" :key="request.Request_ID">
            <td class="col-2">
              {{ request.Staff_FName }} {{ request.Staff_LName }}
            </td>
            <td class="col-2">{{ request.Request_Reason }}</td>
            <td class="col-2">
              {{
                request.WFH_Date + ', ' + get_WFH_period(request.Request_Period)
              }}
            </td>
            <td class="col-2">{{ request.Request_Date }}</td>
            <td class="col-2" id="pending" v-if="request.Status == 'Pending'">
              <BBadge pill variant="info">New Request</BBadge>
            </td>
            <td class="col-1" v-if="request.Status == 'Withdrawal Pending'">
              <BBadge pill variant="warning">Withdrawal</BBadge>
            </td>
            <td class="col-2">
              <template v-if="!isRejecting[request.Request_ID]">
                <StatusButton
                  v-if="request.Status == 'Pending'"
                  @click="updateStatus(request.Request_ID, 'Approved')"
                  label="Accept"
                  class="accept-btn"
                />
                <StatusButton
                  v-if="request.Status == 'Withdrawal Pending'"
                  @click="updateStatus(request.Request_ID, 'Withdrawn')"
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
                    @click="submitRejection(request.Request_ID, request.Status)"
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
                request.WFH_Date + ', ' + get_WFH_period(request.Request_Period)
              }}
            </td>
            <td class="col-2">{{ request.Request_Date }}</td>
            <td class="col-2">{{ request.Decision_Date }}</td>
            <td class="col-2" v-if="request.Status == 'Approved'">
              <StatusButton
                @click="updateStatus(request.Request_ID, 'Withdrawn')"
                label="Withdraw"
                class="withdraw-btn"
              />
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
                request.WFH_Date + ', ' + get_WFH_period(request.Request_Period)
              }}
            </td>
            <td class="col-2">{{ request.Request_Date }}</td>
            <td class="col-2">{{ request.Decision_Date }}</td>
            <td class="col-2">{{ request.Comments }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </BContainer>
</template>

<script>
import StatusButton from './StatusButton.vue';

export default {
  name: 'RequestTable',
  props: {
    requests: Array,
    status: String,
  },
  components: { StatusButton },
  data() {
    return {
      isRejecting: {},
      rejectionReason: {},
    };
  },
  emits: ['updateRequestStatus'],
  methods: {
    startRejection(requestID) {
      // Directly set the value
      this.isRejecting[requestID] = true;
    },
    cancelRejection(requestID) {
      this.isRejecting[requestID] = false; // Reset the rejecting state
      this.rejectionReason[requestID] = ''; // Clear the rejection reason
    },
    submitRejection(requestID, status) {
      if (!this.rejectionReason[requestID]?.trim()) {
        alert('Rejection reason is required');
        return;
      }
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
      }

      this.cancelRejection(requestID);
    },
    updateStatus(requestID, newStatus) {
      const validStatuses = ['Approved', 'Rejected', 'Withdrawn'];
      if (validStatuses.includes(newStatus)) {
        this.$emit('updateRequestStatus', requestID, newStatus);
      } else {
        console.error(`Invalid status: ${newStatus}`);
      }
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
</style>
