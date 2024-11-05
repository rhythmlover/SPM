<script>
import axios from 'axios';
import { inject } from 'vue';

export default {
  data() {
    return {
      API_ROUTE: inject('API_ROUTE'),
      Staff_ID: localStorage.staffID,
      Request_Date: new Date().toISOString().split('T')[0],
      Request_Period: '',
      Request_Reason: '',
      WFH_Date: '',
      Status: 'Pending',
      Approver_ID: '',
      Approver_Name: '',
      existingWFHDates: [],
      isLoading: false,
      validDatePeriod: [],
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
    isDateDisabled() {
      return (date) => {
        return this.existingWFHDates.includes(date) || this.isWeekend(date);
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
        this.modalTitle = 'Error';
        this.modalMessage = 'Failed to fetch reporting manager information';
        this.showAlertModal = true;
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
        console.error('Error fetching WFH dates:', error);
        this.modalTitle = 'Error';
        this.modalMessage = 'Failed to fetch existing WFH dates';
        this.showAlertModal = true;
        console.log(error);
      }
    },
    validateForm() {
      if (!this.WFH_Date || !this.Request_Period || !this.Request_Reason) {
        this.modalTitle = 'Error';
        this.modalMessage = 'Please fill in all fields';
        this.showAlertModal = true;
        return false;
      }

      const WFHDate = new Date(this.WFH_Date);
      if (
        WFHDate < new Date(this.minDate) ||
        WFHDate > new Date(this.maxDate)
      ) {
        this.modalTitle = 'Error';
        this.modalMessage = 'Request date is outside the allowed range';
        this.showAlertModal = true;
        return false;
      }

      if (this.isDateDisabled(this.WFH_Date)) {
        this.modalTitle = 'Error';
        this.modalMessage = 'This date already has a request or is a weekend';
        this.showAlertModal = true;
        return false;
      }

      this.validDatesPeriod = [[this.WFH_Date, this.Request_Period]];

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

      console.log('Valid Dates Period:', this.validDatesPeriod);
      console.log('Clashing Dates:', clashingDates);
      console.log('Existing WFH Dates:', this.existingWFHDates);

      if (clashingDates.length > 0) {
        this.modalTitle = 'Error';
        this.modalMessage =
          'You have a clashing request for the chosen date and period';
        this.showAlertModal = true;
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
          `${this.API_ROUTE}/wfh-request/apply`,
          {
            Staff_ID: this.Staff_ID,
            Request_Date: this.Request_Date,
            Request_Period: this.Request_Period,
            Request_Reason: this.Request_Reason,
            Status: this.Status,
            Approver_ID: this.Approver_ID,
            WFH_Date: this.WFH_Date,
          },
        );

        this.modalTitle = 'Success';
        this.modalMessage = 'Request Submitted Successfully';
        this.showAlertModal = true;

        console.log(response);
        setTimeout(() => {
          this.resetForm();
        }, 3000);
      } catch (error) {
        console.log(error);
        this.modalTitle = 'Error';
        this.modalMessage =
          error.response?.data?.message || 'Request Submission Failed';
        this.showAlertModal = true;
      } finally {
        this.isLoading = false;
        this.WFH_Date = '';
        this.Request_Period = '';
        this.Request_Reason = '';
        await this.fetchExistingWFHDates();
      }
    },
    resetForm() {
      this.WFH_Date = '';
      this.Request_Period = '';
      this.Request_Reason = '';
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
        <label for="wfh_date">WFH Date:</label>
        <input
          type="date"
          v-model="WFH_Date"
          id="wfh_date"
          class="form-control"
          :min="minDate"
          :max="maxDate"
          :class="{ 'is-invalid': isDateDisabled(WFH_Date) }"
        />
        <div v-if="isDateDisabled(WFH_Date)" class="invalid-feedback">
          This date is not selectable (already requested or a weekend).
        </div>
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
      <button
        type="submit"
        class="btn btn-primary m-1"
        :disabled="isLoading || isDateDisabled(WFH_Date)"
      >
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
