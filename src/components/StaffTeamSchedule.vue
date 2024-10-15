<!-- StaffTeamSchedule.vue -->
<template>
  <div>
    <b-row class="mb-4 align-items-center">
      <b-col cols="auto">
        <b-form-checkbox v-model="isMonthView" switch size="lg">
          {{ isMonthView ? 'Month' : 'Week' }}
        </b-form-checkbox>
      </b-col>
    </b-row>

    <b-row class="mb-4">
      <b-col md="6" offset-md="3">
        <b-form-group
          label="Enter Staff ID:"
          label-for="staffID"
          label-class="font-weight-bold"
        >
          <b-form-input
            id="staffID"
            v-model="staffID"
            type="number"
            placeholder="Enter Staff ID"
            @input="fetchSchedule"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-row>

    <b-row class="mb-4 align-items-center">
      <b-col cols="auto">
        <b-button @click="previousPeriod" variant="outline-primary">
          <b-icon icon="chevron-left"></b-icon> Previous
        </b-button>
      </b-col>
      <b-col class="text-center">
        <h2>{{ currentPeriod }}</h2>
      </b-col>
      <b-col cols="auto">
        <b-button @click="nextPeriod" variant="outline-primary">
          Next <b-icon icon="chevron-right"></b-icon>
        </b-button>
      </b-col>
    </b-row>

    <b-row v-if="error">
      <b-col>
        <b-alert show variant="danger">{{ error }}</b-alert>
      </b-col>
    </b-row>

    <template v-else>
      <b-row v-for="(dayInfo, date) in datesInPeriod" :key="date" class="mb-4">
        <b-col>
          <b-card>
            <template #header>
              <h3 class="mb-0">{{ formatDate(date) }}</h3>
            </template>
            <b-list-group flush>
              <template v-if="dayInfo.requests.length">
                <b-list-group-item
                  v-for="request in dayInfo.requests"
                  :key="request.Request_ID"
                  class="d-flex justify-content-between align-items-center"
                  :class="{ 'user-request': isUserRequest(request) }"
                  :style="getUserRequestStyle(request)"
                >
                  <div class="d-flex align-items-center">
                    <b-badge
                      pill
                      :variant="getStatusVariant(request.Status)"
                      class="mr-2"
                    ></b-badge>
                    <span class="mr-2">{{ request.Request_Period }}</span>
                    <strong class="ms-2">
                      {{ request.Staff_FName }} {{ request.Staff_LName }}
                      <span v-if="isUserRequest(request)" class="text-primary"
                        >(YOU)</span
                      >
                    </strong>
                  </div>
                  <div>
                    <b-badge :variant="getStatusVariant(request.Status)">{{
                      request.Status
                    }}</b-badge>
                    <b-badge
                      v-if="request.Comments"
                      variant="info"
                      class="ml-2"
                    >
                      {{ request.Comments }}
                    </b-badge>
                  </div>
                </b-list-group-item>
              </template>
              <b-list-group-item v-else>
                No WFH requests for this day
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

export default {
  name: 'StaffTeamSchedule',
  setup() {
    const staffID = ref('');
    const viewingDate = ref(new Date());
    const datesInPeriod = ref({});
    const error = ref(null);
    const isMonthView = ref(true);

    // Define API_ROUTE
    const API_ROUTE = import.meta.env.DEV
      ? 'http://localhost:3000'
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;

    const currentPeriod = computed(() => {
      if (isMonthView.value) {
        return viewingDate.value.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        });
      } else {
        const endOfWeek = new Date(viewingDate.value);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${viewingDate.value.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
    });

    const getWFHRequests = async (staffID) => {
      try {
        const res = await axios.get(
          `${API_ROUTE}/teamlist/byReportingManager`,
          {
            params: { Staff_ID: staffID },
          },
        );

        if (
          typeof res.data === 'string' &&
          res.data.includes('<!DOCTYPE html>')
        ) {
          throw new Error(
            'Received HTML instead of JSON. Check API endpoint configuration.',
          );
        }

        if (Array.isArray(res.data.employeeRequests)) {
          return res.data.employeeRequests.flatMap((employeeObj) =>
            employeeObj.wfhRequests.map((wfhRequest) => ({
              ...wfhRequest,
              Staff_FName: employeeObj.employee.Staff_FName,
              Staff_LName: employeeObj.employee.Staff_LName,
              Staff_ID: employeeObj.employee.Staff_ID.toString(),
              Request_Date: new Date(
                wfhRequest.Request_Date,
              ).toLocaleDateString('en-CA'),
            })),
          );
        } else {
          throw new Error('employeeRequests is not an array');
        }
      } catch (error) {
        console.error('Error fetching WFH requests:', error);
        throw error;
      }
    };

    const getDatesInPeriod = async () => {
      const year = viewingDate.value.getFullYear();
      const month = viewingDate.value.getMonth();
      let startDate, endDate;

      if (isMonthView.value) {
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
      } else {
        startDate = new Date(viewingDate.value);
        endDate = new Date(viewingDate.value);
        endDate.setDate(endDate.getDate() + 6);
      }

      let newMap = {};
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const formattedDate = d.toLocaleDateString('en-CA');
        newMap[formattedDate] = { dateObj: new Date(d), requests: [] };
      }

      if (staffID.value) {
        try {
          const requests = await getWFHRequests(staffID.value);
          requests.forEach((request) => {
            const requestDate = request.Request_Date;
            if (newMap[requestDate]) {
              newMap[requestDate].requests.push(request);
            }
          });
        } catch (err) {
          error.value = err.message;
        }
      }

      datesInPeriod.value = newMap;
    };

    const fetchSchedule = async () => {
      error.value = null;
      if (staffID.value) {
        await getDatesInPeriod();
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    };

    const getStatusVariant = (status) => {
      return status.toLowerCase() === 'pending' ? 'warning' : 'success';
    };

    const isUserRequest = (request) => {
      return request.Staff_ID === staffID.value.toString();
    };

    const getUserRequestStyle = (request) => {
      if (isUserRequest(request)) {
        const color =
          request.Status.toLowerCase() === 'pending' ? 'yellow' : 'green';
        return {
          border: `2px solid ${color}`,
          boxShadow: `0 0 5px ${color}`,
        };
      }
      return {};
    };

    const previousPeriod = () => {
      if (isMonthView.value) {
        viewingDate.value = new Date(
          viewingDate.value.getFullYear(),
          viewingDate.value.getMonth() - 1,
          1,
        );
      } else {
        viewingDate.value = new Date(
          viewingDate.value.getFullYear(),
          viewingDate.value.getMonth(),
          viewingDate.value.getDate() - 7,
        );
      }
    };

    const nextPeriod = () => {
      if (isMonthView.value) {
        viewingDate.value = new Date(
          viewingDate.value.getFullYear(),
          viewingDate.value.getMonth() + 1,
          1,
        );
      } else {
        viewingDate.value = new Date(
          viewingDate.value.getFullYear(),
          viewingDate.value.getMonth(),
          viewingDate.value.getDate() + 7,
        );
      }
    };

    watch([viewingDate, isMonthView], () => {
      fetchSchedule();
    });

    onMounted(async () => {
      await getDatesInPeriod();
    });

    return {
      staffID,
      viewingDate,
      datesInPeriod,
      error,
      isMonthView,
      currentPeriod,
      fetchSchedule,
      formatDate,
      getStatusVariant,
      isUserRequest,
      getUserRequestStyle,
      previousPeriod,
      nextPeriod,
    };
  },
};
</script>

<style scoped>
.user-request {
  transition: all 0.3s ease;
}
.user-request:hover {
  transform: scale(1.02);
}
</style>
