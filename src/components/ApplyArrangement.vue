<script>
import axios from 'axios';
import { inject } from 'vue';

export default {
  data() {
    return {
      Staff_ID: '171015',
      Request_Date: new Date().toISOString().split('T')[0],
      Request_Period: '',
      Request_Reason: '',
      WFH_Date: '',
      Status: 'Pending',
      Approver_ID: '',
      Approver_Name: '',
      errorMessage: '',
      successMessage: '',
      existingWFHDates: [],
    };
  },
  computed: {},
  methods: {
    async fetchReportingManagerID() {
      const API_ROUTE = inject('API_ROUTE');
      try {
        const response = await axios.get(API_ROUTE + '/employee/get-staff-reporting-manager', {
          params: { staffID: this.Staff_ID },
        });
        const reportingManagerID = response.data.results[0].Reporting_Manager;
        this.Approver_ID = reportingManagerID;

        const reportingManagerName = await axios.get(API_ROUTE + '/employee/get-staff-name-by-id', {
          params: { staffID: reportingManagerID },
        });
        this.Approver_Name = reportingManagerName.data.name;
        console.log(this.Approver_Name);
      } catch (error) {
        console.log(error);
      }
    },
    async fetchExistingWFHDates() {
      const API_ROUTE = inject('API_ROUTE');
      try {
        const response = await axios.get(API_ROUTE + '/wfh-request/user', {
          params: { staffID: this.Staff_ID },
        });
        this.existingWFHDates = response.data.results.map((request) => request.WFH_Date);
      } catch (error) {
        console.log(error);
      }
    },
    validateForm() {
      if (!this.WFH_Date || !this.Request_Period || !this.Request_Reason) {
        this.errorMessage = 'Please fill in all fields';
        return false;
      }

      const minDate = new Date(this.getMinDate());
      const maxDate = new Date(this.getMaxDate());
      const requestDate = new Date(this.Request_Date);

      if (requestDate < minDate || requestDate > maxDate) {
        this.errorMessage = 'Request date is outside the allowed range';
        return false;
      }

      return true;
    },
    async apply() {
      if (!this.validateForm()) {
        return;
      }

      // const API_ROUTE = inject('API_ROUTE');
      const API_ROUTE = import.meta.env.VITE_LOCAL_API_ENDPOINT;
      try {
        const response = await axios.post(API_ROUTE + '/wfh-request/apply', {
          Staff_ID: this.Staff_ID,
          Request_Date: this.Request_Date,
          Request_Period: this.Request_Period,
          Request_Reason: this.Request_Reason,
          Status: this.Status,
          Approver_ID: this.Approver_ID,
          WFH_Date: this.WFH_Date,
        });
        this.successMessage = 'Request Submitted Successfully';
        this.errorMessage = '';
        console.log(response);
      } catch (error) {
        console.log(error);
        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = 'Application Submission Failed';
        }
        this.successMessage = '';
      }
    },
    cancel() {
      this.WFH_Date = '';
      this.Request_Period = '';
      this.Request_Reason = '';
      this.errorMessage = '';
      this.successMessage = '';
      this.$router.push('/staffMySchedule');
    },
    getMinDate() {
      const date = new Date();
      date.setMonth(date.getMonth() - 2);
      return date.toISOString().split('T')[0];
    },
    getMaxDate() {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date.toISOString().split('T')[0];
    },
    isDateDisabled(date) {
      return this.existingWFHDates.includes(date);
    },
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
        <label for="wfh_date">Requested WFH Date:</label>
        <input
          type="date"
          v-model="WFH_Date"
          id="wfh_date"
          class="form-control"
          :min="getMinDate()"
          :max="getMaxDate()"
          :class="{ 'is-invalid': isDateDisabled(Request_Date) }"
        />
        <div v-if="isDateDisabled(WFH_Date)" class="invalid-feedback">
          This date already has a request.
        </div>
      </div>
      <div class="form-group mb-3">
        <label for="request_period">Request Period:</label>
        <select v-model="Request_Period" id="request_period" class="form-control">
          <option value="AM">AM</option>
          <option value="PM">PM</option>
          <option value="Full-Day">Full-Day</option>
        </select>
      </div>
      <div class="form-group mb-3">
        <label for="reason">Request_Reason:</label>
        <input type="text" v-model="Request_Reason" id="reason" class="form-control" />
      </div>
      <div class="form-group mb-3">
        <label for="approver_name">Approver Name:</label>
        <input
          type="text"
          v-model="Approver_Name"
          id="approver_name"
          class="form-control"
          disabled
        />
      </div>
      <div v-if="errorMessage" class="alert alert-danger mb-3">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success mb-3">{{ successMessage }}</div>
      <button type="submit" class="btn btn-primary m-1">Submit</button>
      <button type="button" class="btn btn-secondary m-1" @click="cancel">Cancel</button>
    </form>
  </div>
</template>
