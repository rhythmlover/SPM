<template>
    <tr>
        <td class="col-2">{{ request.Staff_FName }} {{ request.Staff_LName }}</td>
        <td class="col-4">{{ request.Reason }}</td>
        <td class="col-2">{{ request.WFH_Date }}</td>
        <td class="col-2">{{ formatRequestDate(request.Request_Date) }}</td>
        <td class="col-2" v-if="status !== 'rejected'">
        <StatusButton v-if="status === 'pending'" 
            @click="updateStatus('Approved')"
            label="Accept" btnClass="btn-success"
        />
        <StatusButton v-if="status === 'pending'" 
            @click="updateStatus('Rejected')"
            label="Reject" btnClass="btn-danger"
        />
        <StatusButton v-if="status === 'accepted'" 
            @click="updateStatus('Withdrawn')"
            label="Withdraw" btnClass="btn-outline-success"
        />
        </td>
        <td class="col-2" v-if="status === 'rejected'">{{ request.Comments }}</td>
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
  methods: {
    formatRequestDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }) + ' ' + new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    },
    updateStatus(newStatus) {
      this.$emit('updateRequestStatus', this.request.Request_ID, newStatus);
    }
  }
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
</style>