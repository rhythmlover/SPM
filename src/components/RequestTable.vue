<template>
  <BContainer :style="{ marginTop: '20px' }">
    <div class="request-table">
      <table class="table">
        <thead>
          <tr v-if="status === 'pending'">
            <th class="col-2">Name</th>
            <th class="col-4">Reason for Request</th>
            <th class="col-2">WFH Date</th>
            <th class="col-2">Requested On</th>
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
            <th class="col-2">Reason</th>
          </tr>
        </thead>
        <tbody v-if="status === 'pending'">
          <tr v-for="request in requests" :key="request.Request_ID">
            <td class="col-2">
              {{ request.Staff_FName }} {{ request.Staff_LName }}
            </td>
            <td class="col-4">{{ request.Request_Reason }}</td>
            <td class="col-2">{{ request.WFH_Date }}</td>
            <td class="col-2">{{ request.Request_Date }}</td>
            <td class="col-2">
              <template
                v-if="!isRejecting[request.Request_ID] && status !== 'accepted'"
              >
                <StatusButton
                  @click="updateStatus(request.Request_ID, 'Approved')"
                  label="Accept"
                  class="accept-btn"
                />
                <StatusButton
                  @click="startRejection(request.Request_ID)"
                  label="Reject"
                  class="reject-btn"
                />
              </template>
              <template v-else-if="isRejecting[request.Request_ID]">
                <textarea
                  v-model="rejectionReason[request.Request_ID]"
                  placeholder="Enter rejection reason"
                  rows="2"
                ></textarea>
                <div class="reject-buttons">
                  <StatusButton
                    @click="submitRejection(request.Request_ID)"
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
        <tbody v-if="status === 'accepted'">
          <tr v-for="request in requests" :key="request.Request_ID">
            <td class="col-2">
              {{ request.Staff_FName }} {{ request.Staff_LName }}
            </td>
            <td class="col-2">{{ request.Request_Reason }}</td>
            <td class="col-2">{{ request.WFH_Date }}</td>
            <td class="col-2">{{ request.Request_Date }}</td>
            <td class="col-2">{{ request.Approval_Date }}</td>
            <td class="col-2">
              <StatusButton
                @click="updateStatus(request.Request_ID, 'Withdrawn')"
                label="Withdraw"
                class="withdraw-btn"
              />
            </td>
          </tr>
        </tbody>
        <tbody v-if="status === 'rejected'">
          <tr v-for="request in requests" :key="request.Request_ID">
            <td class="col-2">
              {{ request.Staff_FName }} {{ request.Staff_LName }}
            </td>
            <td class="col-2">{{ request.Request_Reason }}</td>
            <td class="col-2">{{ request.WFH_Date }}</td>
            <td class="col-2">{{ request.Request_Date }}</td>
            <td class="col-2">{{ request.Approval_Date }}</td>
            <td class="col-2">{{ request.Approval_Comments }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </BContainer>
</template>

<script>
import StatusButton from './StatusButton.vue'; // Importing the StatusButton component

export default {
  name: 'RequestTable',
  props: {
    requests: Array,
    status: String,
  },
  components: { StatusButton }, // Declaring the StatusButton component
  data() {
    return {
      isRejecting: {}, // Object to track which request IDs are being rejected
      rejectionReason: {}, // Object to hold rejection reasons for each request ID
    };
  },
  emits: ['updateRequestStatus', 'rejectRequest'],
  methods: {
    startRejection(requestID) {
      this.isRejecting[requestID] = true; // Set the rejection state for the specific request ID
    },
    cancelRejection(requestID) {
      this.isRejecting[requestID] = false; // Reset the rejection state for the specific request ID
      this.rejectionReason[requestID] = ''; // Clear the rejection reason
    },
    submitRejection(requestID) {
      // Check if the rejection reason is empty or only contains whitespace
      if (
        !this.rejectionReason[requestID] ||
        this.rejectionReason[requestID].trim() === ''
      ) {
        alert('Rejection reason is required'); // Show alert when reason is empty
        console.log('Rejection reason is empty, cannot reject request.');
        return; // Prevent further execution and status update
      }

      // If the reason is valid, emit the event to update the request status
      console.log('Rejection reason provided, updating status to Rejected.');
      this.$emit(
        'updateRequestStatus',
        requestID,
        'Rejected',
        this.rejectionReason[requestID],
      );

      // Reset the state after submission
      this.isRejecting[requestID] = false; // Close the rejection form
      this.rejectionReason[requestID] = ''; // Clear the rejection reason field
    },
    updateStatus(requestID, newStatus) {
      const validStatuses = ['Approved', 'Rejected', 'Withdrawn'];
      if (validStatuses.includes(newStatus)) {
        this.$emit('updateRequestStatus', requestID, newStatus);
      } else {
        console.error(`Invalid status: ${newStatus}`);
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

.reject-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.reject-submit-btn,
.reject-cancel-btn,
.accept-btn,
.withdraw-btn {
  padding: 5px 10px;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
}

.accept-btn {
  background-color: #28a745;
  color: white;
  border: none;
}

.reject-btn {
  background-color: #dc3545;
  color: white;
  border: none;
}

.reject-submit-btn {
  background-color: #007bff;
  color: white;
  border: none;
}

.reject-cancel-btn {
  background-color: #6c757d;
  color: white;
  border: none;
}

.withdraw-btn {
  background-color: #ffc107;
  color: white;
  border: none;
}
</style>
