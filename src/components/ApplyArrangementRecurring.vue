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
      existingWFHDates: [],
      validDates: [],
      validDatesPeriod: [],
      isLoading: false,
      errorMessage: '',
      showAlertModal: false,
      modalTitle: '',
      modalMessage: '',
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
        console.log(error);
        this.modalTitle = 'Error';
        this.modalMessage = 'Failed to fetch reporting manager information';
        this.showAlertModal = true;
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
      } catch (error) {
        console.log(error);
        this.modalTitle = 'Error';
        this.modalMessage = 'Failed to fetch existing WFH dates';
        this.showAlertModal = true;
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
      this.errorMessage = '';
      this.clashingDates = [];

      if (
        !this.WFH_Date_Start ||
        !this.WFH_Date_End ||
        !this.WFH_Day ||
        !this.Request_Period ||
        !this.Request_Reason
      ) {
        this.modalTitle = 'Error';
        this.modalMessage = 'Please fill in all fields';
        this.showAlertModal = true;
        return false;
      }

      if (this.validDates.length === 0) {
        this.errorMessage =
          'No valid dates found for the selected range and day of the week';
        return false;
      }

      this.validDatesPeriod = this.validDates.map((date) => [
        date,
        this.Request_Period,
      ]);

      const clashingDates = this.validDatesPeriod.filter((validDatePeriod) =>
        this.existingWFHDates.some((existingDatePeriod) => {
          const dateMatches =
            existingDatePeriod[0].trim() === validDatePeriod[0].trim();

          const periodMatches =
            existingDatePeriod[1] === 'FULL' ||
            validDatePeriod[1] === 'FULL' ||
            existingDatePeriod[1] === validDatePeriod[1];

          return dateMatches && periodMatches;
        }),
      );

      if (clashingDates.length > 0) {
        this.errorMessage = `You have a clashing request for the following dates:\n`;
        this.errorMessage += clashingDates
          .map((date) => `${date[0]}`)
          .join('\n');
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
          `${this.API_ROUTE}/wfh-request/apply-recurring`,
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
        console.log(response);
        this.modalTitle = 'Success';
        this.modalMessage = 'Request Submitted Successfully';
        this.showAlertModal = true;

        await this.fetchExistingWFHDates();

        this.resetForm();
      } catch (error) {
        console.log(error);
        this.modalTitle = 'Error';
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.modalMessage = error.response.data.message;
        } else {
          this.modalMessage = 'Request Submission Failed';
        }
        this.showAlertModal = true;
      } finally {
        this.isLoading = false;
      }
    },
    resetForm() {
      this.WFH_Date_Start = '';
      this.WFH_Date_End = '';
      this.WFH_Day = '';
      this.Request_Period = '';
      this.Request_Reason = '';
      this.validDates = [];
      this.errorMessage = '';
    },
    cancel() {
      this.resetForm();
      this.$router.push('/staff-myschedule');
    },
    closeModal() {
      this.showAlertModal = false;
      this.modalTitle = '';
      this.modalMessage = '';
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
        <pre>{{ errorMessage }}</pre>
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

  <div v-if="showAlertModal" class="modal-overlay">
    <div class="modal-dialog">
      <div class="modal-content">
        <div
          class="modal-header"
          :class="{
            'bg-success text-white': modalTitle === 'Success',
            'bg-danger text-white': modalTitle === 'Error',
          }"
        >
          <h5 class="modal-title">{{ modalTitle }}</h5>
        </div>
        <div class="modal-body">
          <p>{{ modalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-dialog {
  background-color: white;
  border-radius: 5px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}
.modal-body {
  padding: 1rem;
}
.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  text-align: right;
}
.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
}
</style>
