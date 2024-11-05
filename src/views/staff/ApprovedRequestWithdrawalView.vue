<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { inject } from 'vue';

export default {
  props: {},
  data() {
    return {
      API_ROUTE: inject('API_ROUTE'),
      Staff_Name: localStorage.staffFName,
      Staff_ID: localStorage.staffID,
      Staff_Position: localStorage.staffPosition,
      Request_ID: this.$route.params.requestID,
      WFH_Date: this.$route.params.WFH_Date,
      Request_Date: '',
      Request_Period: this.$route.params.Request_Period,
      Request_Reason: '',
      Status: '',
      Approver_ID: '',
      Approver_Name: '',
      existingRequestDates: [],
      operationDone: false,
      showAlertModal: false,
      modalTitle: '',
      modalMessage: '',
    };
  },
  watch: {},
  computed: {
    ...mapGetters(['getStaffID']),
  },
  methods: {
    async fetchReportingManagerID() {
      try {
        const response = await axios.get(
          this.API_ROUTE + '/employee/get-staff-reporting-manager',
          {
            params: { staffID: this.Staff_ID },
          },
        );
        const reportingManagerID = response.data.results[0].Reporting_Manager;
        this.Approver_ID = reportingManagerID;

        const reportingManagerName = await axios.get(
          this.API_ROUTE + '/employee/get-staff-name-by-id',
          {
            params: { staffID: reportingManagerID },
          },
        );
        this.Approver_Name = reportingManagerName.data.name;
      } catch (error) {
        console.log(error);
      }
    },
    async withdrawRequest() {
      try {
        const formattedReason = this.Request_Reason.replace(/'/g, "\\'"); // Escapes apostrophes
        await axios.post(`${this.API_ROUTE}/wfh-request/withdraw/post/id`, {
          Staff_Name: this.Staff_Name,
          Staff_Position: this.Staff_Position,
          Request_ID: this.Request_ID,
          Request_Period: this.Request_Period,
          Request_Reason: formattedReason,
          Status: 'Pending',
          Approver_Name: this.Approver_Name,
          WFH_Date: this.WFH_Date,
        });
        this.modalTitle = 'Success';
        this.modalMessage = 'Withdrawal Request Submitted Successfully';
        this.showAlertModal = true;
        this.operationDone = true;
      } catch (error) {
        console.log(error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.modalTitle = 'Error';
          this.modalMessage = error.response.data.message;
        } else {
          this.modalTitle = 'Error';
          this.modalMessage = 'Withdrawal Request Submission Failed';
        }
        this.showAlertModal = true;
        this.successMessage = '';
      }
    },
    cancel() {
      this.Request_Reason = '';
      this.$router.push('/staff-requeststatus');
    },
    closeModal() {
      this.showAlertModal = false;
      this.modalTitle = '';
      this.modalMessage = '';
      if (this.operationDone) {
        this.$router.push('/staff-requeststatus');
      }
    },
  },
  mounted() {
    this.fetchReportingManagerID();
  },
};
</script>

<template>
  <div class="container mt-5">
    <form @submit.prevent="withdrawRequest">
      <div class="form-group mb-3">
        <label for="staff_name">Name:</label>
        <input
          type="text"
          v-model="Staff_Name"
          id="staff__name"
          class="form-control"
          disabled
        />
      </div>
      <div class="form-group mb-3">
        <label for="position">Position:</label>
        <input
          type="text"
          v-model="Staff_Position"
          id="position"
          class="form-control"
          disabled
        />
      </div>
      <div class="form-group mb-3">
        <label for="wfh_date">WFH Date:</label>
        <input
          type="text"
          v-model="WFH_Date"
          id="wfh_date"
          class="form-control"
          disabled
        />
      </div>
      <div class="form-group mb-3">
        <label for="request_period">Withdrawal Request Period:</label>
        <input
          type="text"
          v-model="Request_Period"
          id="request_period"
          class="form-control"
          disabled
        />
      </div>
      <div class="form-group mb-3">
        <label for="reason">Reason for withdrawal:</label>
        <input
          type="text"
          v-model="Request_Reason"
          id="reason"
          class="form-control"
        />
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
      <div v-if="!operationDone">
        <button type="submit" class="btn btn-primary m-1">Submit</button>
        <button type="button" class="btn btn-secondary m-1" @click="cancel">
          Cancel
        </button>
      </div>
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
}

.modal-content {
  border: none;
  border-radius: 5px;
  overflow: hidden;
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
