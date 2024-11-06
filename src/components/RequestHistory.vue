<script>
import { getWFHRequests } from '@/utils/utils';
import { inject, onMounted, ref, watch } from 'vue';
import axios from 'axios';

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

export default {
  name: 'RequestHistory',
  props: {
    requests: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const API_ROUTE = inject('API_ROUTE');
    const staffID = localStorage.getItem('staffID');
    const localRequests = ref([...props.requests]);

    watch(
      () => props.requests,
      (newRequests) => {
        localRequests.value = [...newRequests];
      },
    );

    onMounted(async () => {
      if (staffID) {
        localRequests.value = await getWFHRequests(axios, API_ROUTE, staffID);
      } else {
        console.error('Staff ID is not available.');
      }
    });

    return {
      localRequests,
      formatRequestDate,
      moreThanTwoMonths,
      get_WFH_period,
    };
  },
};

export { get_WFH_period, moreThanTwoMonths, formatRequestDate };
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
        <div v-if="localRequests.length === 0" class="text-center">
          <p>No WFH requests available</p>
        </div>
        <table v-else class="table">
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
                  formatRequestDate(request.WFH_Date) +
                  ', ' +
                  get_WFH_period(request.Request_Period)
                }}
              </td>
              <td class="col-2">
                {{ formatRequestDate(request.Request_Date) }}
              </td>
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
              <td class="col-1" v-if="request.Status == 'Cancelled'">
                <BBadge pill variant="secondary">Cancelled</BBadge>
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
