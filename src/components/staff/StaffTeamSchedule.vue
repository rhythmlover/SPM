<template>
  <div>
    <BRow class="my-2">
      <!-- Day / Week Filter -->
      <BCol class="col-4 col-md-2">
        <BFormSelect
          v-model="isMonthView"
          :options="dayWeekFilterDropdownSelectOptions"
        />
      </BCol>
      <!-- Teammate Filter -->
      <BCol class="col-8 col-md-10">
        <BDropdown text="Filter by Teammate" class="float-end">
          <BDropdownForm>
            <BFormCheckbox
              v-model="selectAllTeammates"
              @change="toggleAllTeammates"
            >
              Select All
            </BFormCheckbox>
            <BFormCheckbox
              v-for="teammate in teammates"
              :key="teammate.Staff_ID"
              v-model="selectedTeammates"
              :value="teammate.Staff_ID"
            >
              {{ teammate.Staff_FName }} {{ teammate.Staff_LName }}
            </BFormCheckbox>
          </BDropdownForm>
        </BDropdown>
      </BCol>
    </BRow>

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
      <b-row
        v-for="(dayInfo, date) in filteredDatesInPeriod"
        :key="date"
        class="mb-4"
      >
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
                  :class="{
                    'user-request': isUserRequest(request),
                  }"
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
                      {{ request.Staff_FName }}
                      {{ request.Staff_LName }}
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
import { ref, computed, onMounted, watch, inject } from 'vue';
import axios from 'axios';

export default {
  name: 'StaffTeamSchedule',
  setup() {
    const staffID = inject('staffID');
    const viewingDate = ref(new Date());
    const datesInPeriod = ref({});
    const error = ref(null);
    const isMonthView = ref(true);

    const dayWeekFilterDropdownSelectOptions = [
      { value: true, text: 'Month' },
      { value: false, text: 'Week' },
    ];

    const API_ROUTE = inject('API_ROUTE');

    // New refs for teammate filtering
    const teammates = ref([]);
    const selectedTeammates = ref([]);
    const selectAllTeammates = ref(true);

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

    const getWFHRequests = async () => {
      try {
        const res = await axios.get(
          `${API_ROUTE}/teamlist/byReportingManager`,
          {
            params: { Staff_ID: staffID.value },
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
          const requests = res.data.employeeRequests.flatMap((employeeObj) =>
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

          // Populate teammates list
          teammates.value = [
            ...new Set(
              requests.map((request) => ({
                Staff_ID: request.Staff_ID,
                Staff_FName: request.Staff_FName,
                Staff_LName: request.Staff_LName,
              })),
            ),
          ];

          // Initialize selectedTeammates with all teammate IDs
          selectedTeammates.value = teammates.value.map(
            (teammate) => teammate.Staff_ID,
          );

          return requests;
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

      try {
        const requests = await getWFHRequests();
        requests.forEach((request) => {
          const requestDate = new Date(request.WFH_Date).toLocaleDateString('en-CA');
          if (newMap[requestDate]) {
            newMap[requestDate].requests.push(request);
          }
        });
      } catch (err) {
        error.value = err.message;
      }

      datesInPeriod.value = newMap;
    };

    const fetchSchedule = async () => {
      error.value = null;
      await getDatesInPeriod();
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

    // New functions for teammate filtering
    const toggleAllTeammates = () => {
      if (selectAllTeammates.value) {
        selectedTeammates.value = teammates.value.map(
          (teammate) => teammate.Staff_ID,
        );
      } else {
        selectedTeammates.value = [];
      }
    };

    const filteredDatesInPeriod = computed(() => {
      const filtered = {};
      Object.entries(datesInPeriod.value).forEach(([date, dayInfo]) => {
        const filteredRequests = dayInfo.requests.filter((request) =>
          selectedTeammates.value.includes(request.Staff_ID),
        );
        filtered[date] = { ...dayInfo, requests: filteredRequests };
      });
      return filtered;
    });

    watch([viewingDate, isMonthView], () => {
      fetchSchedule();
    });

    watch(selectedTeammates, () => {
      selectAllTeammates.value =
        selectedTeammates.value.length === teammates.value.length;
    });

    onMounted(async () => {
      await getDatesInPeriod();
    });

    return {
      staffID,
      viewingDate,
      datesInPeriod,
      filteredDatesInPeriod,
      error,
      isMonthView,
      currentPeriod,
      fetchSchedule,
      formatDate,
      getStatusVariant,
      isUserRequest,
      getUserRequestStyle,
      dayWeekFilterDropdownSelectOptions,
      previousPeriod,
      nextPeriod,
      teammates,
      selectedTeammates,
      selectAllTeammates,
      toggleAllTeammates,
    };
  },
};
</script>

<style scoped>
.user-request {
  transition: all 0.3s ease;
}
</style>
