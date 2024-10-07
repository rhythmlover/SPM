<template>
  <tr>
    <td class="col-2">{{ request.Staff_FName }} {{ request.Staff_LName }}</td>
    <td class="col-4">{{ request.Request_Reason }}</td>
    <td class="col-2">{{ request.Request_Date }}</td>
    <td class="col-2" v-if="status === 'pending'">
      {{ request.Approval_Date }}
    </td>
    <td class="col-2" v-else>{{ request.Approval_Date }}</td>
    <td class="col-2" v-if="status !== 'rejected'">
      <div v-if="!isRejecting && status !== 'accepted'">
        <StatusButton
          @click="updateStatus('Approved')"
          label="Accept"
          class="accept-btn"
        />
        <StatusButton
          @click="startRejection"
          label="Reject"
          class="reject-btn"
        />
      </div>
      <div v-else-if="isRejecting">
        <textarea
          v-model="rejectionReason"
          placeholder="Enter rejection reason"
          rows="2"
        ></textarea>
        <div class="reject-buttons">
          <StatusButton
            @click="submitRejection"
            label="Submit"
            class="reject-submit-btn"
            >Submit
          </StatusButton>
          <StatusButton
            @click="cancelRejection"
            label="Cancel"
            class="reject-cancel-btn"
            >Cancel
          </StatusButton>
        </div>
      </div>
      <div v-else>
        <StatusButton
          v-if="status === 'accepted'"
          @click="updateStatus('Withdrawn')"
          label="Withdraw"
          class="withdraw-btn"
        />
      </div>
    </td>
    <td class="col-2" v-if="status === 'rejected'">
      {{ request.Approval_Comments }}
    </td>
  </tr>
</template>

<script>
import StatusButton from './StatusButton.vue';

export default {
  name: 'RequestRow',
  props: {
    request: Object,
    status: String,
  },
  components: { StatusButton },
  emits: ['updateRequestStatus', 'rejectRequest'],
  data() {
    return {
      isRejecting: false,
      rejectionReason: '',
    };
  },
  methods: {
    startRejection() {
      this.isRejecting = true;
    },
    cancelRejection() {
      this.isRejecting = false;
      this.rejectionReason = '';
    },
    submitRejection() {
      if (
        this.rejectionReason.length > 0 &&
        this.rejectionReason.trim() !== ''
      ) {
        this.$emit(
          'rejectRequest',
          this.request.Request_ID,
          this.rejectionReason,
        );
        this.isRejecting = false;
        this.rejectionReason = '';
      } else {
        alert('Rejection reason is required');
      }
    },
    updateStatus(newStatus) {
      const validStatuses = ['Approved', 'Rejected', 'Withdrawn'];
      if (validStatuses.includes(newStatus)) {
        this.$emit('updateRequestStatus', this.request.Request_ID, newStatus);
      } else {
        console.error(`Invalid status: ${newStatus}`);
      }
    },
  },
};
</script>

<style scoped>
td {
    padding: 20px 25px;
    text-align: left;
    vertical-align: middle;
    font-weight: normal;
    font-size: 14px;
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
</style>
