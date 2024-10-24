<script setup>
import axios from 'axios';
import { inject, onMounted, ref, watch } from 'vue';

const API_ROUTE = inject('API_ROUTE', 'http://localhost:3000');
const staffID = localStorage.getItem('staffID');
const props = defineProps({
    requests: {
        type: Array,
        default: () => [],
    },
});
const localRequests = ref([...props.requests]);

watch(
    () => props.requests,
    (newRequests) => {
        localRequests.value = [...newRequests];
    },
);

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
    return `${month} ${day}, ${year} (${weekday})`;
};

const moreThanTwoMonths = (WFH_Date) => {
    const twoMonthsBefore = new Date();
    twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2);
    const wfhDateObj = new Date(WFH_Date);

    return wfhDateObj <= twoMonthsBefore;
};

const get_WFH_period = (request_period) => {
    if (request_period == 'FULL') {
        return 'Full Day';
    }
    if (request_period == 'AM') {
        return '9am - 1pm';
    }
    if (request_period == 'PM') {
        return '2pm - 6pm';
    }
};

const getWFHRequests = async (staffID) => {
    try {
        const res = await axios.get(`${API_ROUTE}/wfh-request/user`, {
            params: { staffID },
        });
        console.log('WFH requests:', res.data);

        if (res.data && Array.isArray(res.data.results)) {
            localRequests.value = res.data.results
                .filter(requestObj => moreThanTwoMonths(requestObj['WFH_Date']))
                .map((request) => ({
                    Approver_Name: request.Approver.Staff_FName + ' ' + request.Approver.Staff_LName,
                    Staff_ID: request.Staff_ID,
                    Request_ID: request.Request_ID,
                    Request_Date: formatRequestDate(request.Request_Date),
                    WFH_Date: formatRequestDate(request.WFH_Date),
                    Request_Period: request.Request_Period,
                    Reason: request.Request_Reason,
                    Status: request.Status,
                    Comments: request.Comments,
                }));
        } else {
            console.warn('No valid results found in the response.');
        }
    } catch (error) {
        console.error('Error fetching WFH requests:', error);
    }
};

onMounted(async () => {
    if (staffID) {
        await getWFHRequests(staffID);
    } else {
        console.error('Staff ID is not available.');
    }
});
</script>

<template>
    <BContainer>
        <BRow>
            <BCol>
                <h2 class="pb-4">Request History</h2>
            </BCol>
        </BRow>
        <BRow>
            <BCol>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Approver</th>
                            <th>Reason for Request</th>
                            <th>WFH Date</th>
                            <th>Requested On</th>
                            <th>Status</th>
                            <th>Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(request, index) in localRequests" :key="index">
                            <td class="col-1">{{ request.Approver_Name }}</td>
                            <td class="col-2">{{ request.Reason }}</td>
                            <td class="col-3">
                                {{
                                    request.WFH_Date +
                                    ', ' +
                                    get_WFH_period(request.Request_Period)
                                }}
                            </td>
                            <td class="col-2">{{ request.Request_Date }}</td>
                            <td class="col-1" v-if="request.Status == 'Pending'">
                                <BBadge pill variant="info">Pending</BBadge>
                            </td>
                            <td class="col-1" v-if="request.Status == 'Withdrawn'">
                                <BBadge pill variant="secondary">Withdrawn</BBadge>
                            </td>
                            <td class="col-1" v-if="request.Status == 'Withdrawal Pending'">
                                <BBadge pill variant="light">Withdrawn</BBadge>
                            </td>
                            <td class="col-1" v-if="request.Status == 'Approved'">
                                <BBadge pill variant="success">Approved</BBadge>
                            </td>
                            <td class="col-1" v-if="request.Status == 'Rejected'">
                                <BBadge pill variant="danger">Rejected</BBadge>
                            </td>
                            <td class="col-3">{{ request.Comments }}</td>
                        </tr>
                    </tbody>
                </table>
            </BCol>
        </BRow>
    </BContainer>
</template>

<style scoped>
th,
td {
  padding: 12px 15px;
  text-align: left;
  vertical-align: middle;
  border: 1px solid #ddd;
}

table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.status {
  padding: 5px 10px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
}
</style>