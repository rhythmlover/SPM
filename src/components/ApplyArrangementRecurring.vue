<script>
import axios from 'axios';
import { inject } from 'vue';

export default {
  data() {
    return {
      API_ROUTE: inject('API_ROUTE'),
      Staff_ID: localStorage.staffID,
      Request_Date: new Date().toISOString().split('T')[0],
      Request_Reason: '',
      WFH_Date_Start: '',
      WFH_Date_End: '',
      WFH_Day: '',
      Request_Period: '',
      Status: 'Pending',
      Approver_ID: '',
      Approver_Name: '',
      errorMessage: '',
      successMessage: '',
      existingWFHDates: [],
      validDates: [],
      isLoading: false,
    };
  },
  computed: {
    isWeekend() {
      return (date) => {
        const day = new Date(date).getDay();
        return day === 0 || day === 6;
      };
    },
    minDate() {
      const date = new Date();
      date.setMonth(date.getMonth() - 2);
      return date.toISOString().split('T')[0];
    },
    maxDate() {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date.toISOString().split('T')[0];
    },
  },
  methods: {
    async fetchReportingManagerID() {
      try {
        const response = await axios.get(
          `${this.API_ROUTE}/employee/get-staff-reporting-manager`,
          { params: { staffID: this.Staff_ID } },
        );

        const reportingManagerID = response.data.results[0]?.Reporting_Manager;
        this.Approver_ID = reportingManagerID;

        if (reportingManagerID) {
          const reportingManagerName = await axios.get(
            `${this.API_ROUTE}/employee/get-staff-name-by-id`,
            { params: { staffID: reportingManagerID } },
          );
          this.Approver_Name = reportingManagerName.data.name;
        }
      } catch (error) {
        this.errorMessage = 'Failed to fetch reporting manager information';
        console.log(error);
      }
    },
    async fetchExistingWFHDates() {
      try {
        const [nonRecurringResponse, recurringResponse] = await Promise.all([
          axios.get(`${this.API_ROUTE}/wfh-request/user/non-recurring-dates`, {
            params: { staffID: this.Staff_ID },
          }),
          axios.get(`${this.API_ROUTE}/wfh-request/user/recurring-dates`, {
            params: { staffID: this.Staff_ID },
          }),
        ]);

        const nonRecurringDates = nonRecurringResponse.data.results;
        const recurringDates = recurringResponse.data.recurringDates;

        this.existingWFHDates = [...nonRecurringDates, ...recurringDates];
        console.log('Existing WFH Dates:', this.existingWFHDates);
      } catch (error) {
        this.errorMessage = 'Failed to fetch existing WFH dates';
        console.log(error);
      }
    },
    getDatesInRange(startDate, endDate, dayOfWeek) {
      const dates = [];
      let currentDate = new Date(startDate);

      while (currentDate <= new Date(endDate)) {
        if (currentDate.getDay() === parseInt(dayOfWeek)) {
          dates.push(currentDate.toISOString().split('T')[0]);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    },
    updateValidDates() {
      if (!this.WFH_Date_Start || !this.WFH_Date_End || !this.WFH_Day) {
        this.errorMessage = 'Please fill in all fields';
        this.validDates = [];
        return;
      }

      const minDate = new Date(this.minDate);
      const maxDate = new Date(this.maxDate);
      const wfhDateStart = new Date(this.WFH_Date_Start);
      const wfhDateEnd = new Date(this.WFH_Date_End);

      if (
        wfhDateStart < minDate ||
        wfhDateStart > maxDate ||
        wfhDateEnd < minDate ||
        wfhDateEnd > maxDate
      ) {
        this.errorMessage = 'WFH dates are outside the allowed range';
        this.validDates = [];
        return;
      }

      this.validDates = this.getDatesInRange(
        this.WFH_Date_Start,
        this.WFH_Date_End,
        this.WFH_Day,
      );

      if (this.validDates.length === 0) {
        this.errorMessage =
          'No valid dates found for the selected range and day of the week';
      } else {
        this.errorMessage = '';
      }
    },
    validateForm() {
      this.successMessage = '';
      this.errorMessage = '';
      this.clashingDates = [];

      if (
        !this.WFH_Date_Start ||
        !this.WFH_Date_End ||
        !this.WFH_Day ||
        !this.Request_Period ||
        !this.Request_Reason
      ) {
        this.errorMessage = 'Please fill in all fields';
        return false;
      }

      if (this.validDates.length === 0) {
        this.errorMessage =
          'No valid dates found for the selected range and day of the week';
        return false;
      }

      const clashingDates = this.validDates.filter((date) =>
        this.existingWFHDates.map((d) => d.trim()).includes(date.trim()),
      );
      console.log('Valid Dates:', this.validDates);
      console.log('Clashing Dates:', clashingDates);
      console.log('Existing WFH Dates:', this.existingWFHDates);

      if (clashingDates.length > 0) {
        this.errorMessage = `You already have a request for the following dates: ${clashingDates.join(', ')}`;
        return false;
      }

      return true;
    },
    async apply() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;

      try {
        const response = await axios.post(
          this.API_ROUTE + '/wfh-request/apply-recurring',
          {
            Staff_ID: this.Staff_ID,
            WFH_Date_Start: this.WFH_Date_Start,
            WFH_Date_End: this.WFH_Date_End,
            WFH_Day: this.WFH_Day,
            Request_Period: this.Request_Period,
            Request_Date: this.Request_Date,
            Request_Reason: this.Request_Reason,
            Approver_ID: this.Approver_ID,
          },
        );
        this.successMessage = 'Request Submitted Successfully';
        this.errorMessage = '';
        console.log(response);

        await this.fetchExistingWFHDates();
      } catch (error) {
        console.log(error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Application Submission Failed';
        }
        this.successMessage = '';
      } finally {
        this.isLoading = false;
        this.WFH_Date_Start = '';
        this.WFH_Date_End = '';
        this.WFH_Day = '';
        this.Request_Period = '';
        this.Request_Reason = '';
      }
    },
    cancel() {
      this.WFH_Date_Start = '';
      this.WFH_Date_End = '';
      this.WFH_Day = '';
      this.Request_Period = '';
      this.Request_Reason = '';
      this.errorMessage = '';
      this.successMessage = '';
      this.validDates = [];
      this.$router.push('/staff-myschedule');
    },
    checkAndUpdateValidDates() {
      if (this.WFH_Date_Start && this.WFH_Date_End && this.WFH_Day) {
        this.updateValidDates();
      }
    },
  },
  watch: {
    WFH_Date_Start: 'checkAndUpdateValidDates',
    WFH_Date_End: 'checkAndUpdateValidDates',
    WFH_Day: 'checkAndUpdateValidDates',
  },
  mounted() {
    this.fetchReportingManagerID();
    this.fetchExistingWFHDates();
  },
};
</script>

<template>
  <div class="container mt-5">
    <form @submit.prevent="apply">
      <div class="form-group mb-3">
        <label for="wfh_date_start">Date Start:</label>
        <input
          type="date"
          v-model="WFH_Date_Start"
          id="wfh_date_start"
          class="form-control"
          :min="minDate"
          :max="maxDate"
        />
      </div>
      <div class="form-group mb-3">
        <label for="wfh_date_end">Date End:</label>
        <input
          type="date"
          v-model="WFH_Date_End"
          id="wfh_date_end"
          class="form-control"
          :min="minDate"
          :max="maxDate"
        />
      </div>
      <div class="form-group mb-3">
        <label for="wfh_day">Day of the Week:</label>
        <select v-model="WFH_Day" id="wfh_day" class="form-control">
          <option value="1">Monday</option>
          <option value="2">Tuesday</option>
          <option value="3">Wednesday</option>
          <option value="4">Thursday</option>
          <option value="5">Friday</option>
        </select>
      </div>
      <div v-if="validDates.length > 0" class="alert alert-info mb-3">
        <p>Applied Dates:</p>
        <ul>
          <li v-for="date in validDates" :key="date">
            {{ date }}
          </li>
        </ul>
      </div>
      <div class="form-group mb-3">
        <label for="request_period">Period:</label>
        <select
          v-model="Request_Period"
          id="request_period"
          class="form-control"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
          <option value="FULL">Full-Day</option>
        </select>
      </div>
      <div class="form-group mb-3">
        <label for="reason">Reason:</label>
        <input
          type="text"
          v-model="Request_Reason"
          id="reason"
          class="form-control"
        />
      </div>
      <div class="form-group mb-3">
        <label for="approver_name">Approver:</label>
        <input
          type="text"
          v-model="Approver_Name"
          id="approver_name"
          class="form-control"
          disabled
        />
      </div>
      <div v-if="errorMessage" class="alert alert-danger mb-3">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="alert alert-success mb-3">
        {{ successMessage }}
      </div>
      <button type="submit" class="btn btn-primary m-1" :disabled="isLoading">
        <span v-if="isLoading">Loading...</span>
        <span v-else>Submit</span>
      </button>
      <button type="button" class="btn btn-secondary m-1" @click="cancel">
        Cancel
      </button>
    </form>
  </div>
</template>
