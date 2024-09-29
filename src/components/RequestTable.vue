<template>
    <div class="request-table">
        <table class="table">
            <thead>
                <tr>
                    <th class="col-2">Name</th>
                    <th class="col-4">Reason for Request</th>
                    <th class="col-2">WFH Date</th>
                    <th class="col-2">Requested On</th>
                    <th class="col-2" v-if="status !== 'rejected'">Actions</th>
                    <th class="col-2" v-if="status === 'rejected'">Reason</th>
                </tr>
            </thead>
        </table>
    </div>
    <div class="request-rows">
        <table class="table">
            <tbody>
                <RequestRow v-for="request in requests" :key="request.Request_ID" :request="request" :status="status"
                    @updateRequestStatus="updateRequestStatus" />
            </tbody>
        </table>
    </div>
</template>

<script>
import RequestRow from './RequestRow.vue';

export default {
    name: 'RequestTable',
    props: {
        requests: Array,
        status: String,  // 'pending', 'accepted', or 'rejected'
    },
    methods: {
        updateRequestStatus(requestID, newStatus) {
            this.$emit('updateRequestStatus', requestID, newStatus);
        }
    }
};
</script>

<style scoped>
.request-table {
    background-color: white;
    border-radius: 10px;
    padding-left: 25px;
    padding-right: 20px;
    margin-top: 20px;
}

.request-table th,
.request-table td {
    padding: 10px;
    text-align: left;
    vertical-align: middle;
    font-weight: bold;
}

.request-rows {
    background-color: white;
    border-radius: 10px;
    padding: 10px;
}
</style>