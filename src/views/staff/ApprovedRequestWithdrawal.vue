<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
// import { inject } from 'vue';

export default {
  data() {
    return {
      Staff_Name: '',
      Staff_ID: '171015',
      Staff_Position: '',
      Request_ID: '',
      Request_Date: '',
      Request_Period: '',
      Reason: '',
      Status: 'Pending',
      Approver_ID: '',
      Approver_Name: '',
      errorMessage: '',
      successMessage: '',
      existingRequestDates: [],
    };
  },
  computed: {
    ...mapGetters(['getStaffID']),
  },
  methods: {
    async fetchReportingManagerID() {
      // const API_ROUTE = inject('API_ROUTE');
      const API_ROUTE = import.meta.env.VITE_LOCAL_API_ENDPOINT;
      try {
        const response = await axios.get(API_ROUTE + '/employee/getStaffReportingManager', {
          params: { staffID: this.Staff_ID },
        });
        const reportingManagerID = response.data.results[0].Reporting_Manager;
        this.Approver_ID = reportingManagerID;

        const reportingManagerName = await axios.get(API_ROUTE + '/employee/getStaffNameByID', {
          params: { staffID: reportingManagerID },
        });
        this.Approver_Name = reportingManagerName.data.name;
      } catch (error) {
        console.log(error);
      }
    },
    async fetchStaffName() {
      const API_ROUTE = import.meta.env.VITE_LOCAL_API_ENDPOINT;
      try {
        const response = await axios.get(API_ROUTE + '/employee/getStaffNameByID', {
          params: { staffID: this.Staff_ID },
        });

        // Extract the name from the response
        const { name } = response.data;
        this.Staff_Name = name;  // Set the name in the component data

      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 404) {
          this.errorMessage = 'Staff not found';
        } else {
          this.errorMessage = 'Failed to fetch staff name';
        }
      }
    },
    async fetchStaffPosition() {
      const API_ROUTE = import.meta.env.VITE_LOCAL_API_ENDPOINT;
      try {
        const response = await axios.get(API_ROUTE + '/employee/getStaffPositionByID', {
          params: { staffID: this.Staff_ID },
        });

        // Extract the position from the response
        const { position } = response.data;
        this.Staff_Position = position;  // Set the position in the component data

      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 404) {
          this.errorMessage = 'Position not found';
        } else {
          this.errorMessage = 'Failed to fetch staff position';
        }
      }
    },
    // async fetchWFHDate() {
    //   const API_ROUTE = import.meta.env.VITE_LOCAL_API_ENDPOINT;
    //   try {
    //     const response = await axios.get(API_ROUTE + '/employee/getStaffWFHDateByID', {
    //       params: { requestID: this.Request_ID },  // Replace staffID with requestID
    //     });

    //     // Extract the WFH date from the response
    //     const { wfh_date } = response.data;
    //     this.WFH_Date = wfh_date;  // Set the WFH date in the component data

    //   } catch (error) {
    //     console.log(error);
    //     if (error.response && error.response.status === 404) {
    //       this.errorMessage = 'WFH Date not found';
    //     } else {
    //       this.errorMessage = 'Failed to fetch WFH date';
    //     }
    //   }
    // },
    validateForm() {
      if (!this.Request_Date || !this.Request_Period || !this.Reason) {
        this.errorMessage = 'Please fill in all fields';
        return false;
      }

      return true;
    },
    // async apply() {
    //   if (!this.validateForm()) {
    //     return;
    //   }

    //   // const API_ROUTE = inject('API_ROUTE');
    //   const API_ROUTE = import.meta.env.VITE_LOCAL_API_ENDPOINT;
    //   try {
    //     const response = await axios.post(API_ROUTE + '/wfh-request/approvedwithdraw', {
    //       Staff_Name: this.Staff_Name,
    //       Staff_ID: this.Staff_ID,
    //       Staff_Position: this.Staff_Position,
    //       Request_ID: this.Request_ID,
    //       Request_Date: this.Request_Date,
    //       Request_Period: this.Request_Period,
    //       Reason: this.Reason,
    //       Status: this.Status,
    //       Approver_ID: this.Approver_ID,
    //     });
    //     this.successMessage = 'Request Submitted Successfully';
    //     this.errorMessage = '';
    //     console.log(response);
    //   } catch (error) {
    //     console.log(error);
    //     if (error.response && error.response.data && error.response.data.message) {
    //       this.errorMessage = error.response.data.message;
    //     } else {
    //       this.errorMessage = 'Application Submission Failed';
    //     }
    //     this.successMessage = '';
    //   }
    // },
    async withdrawRequest(requestID, WFH_Date) {
      // You can add this logic to call your backend for withdrawal
      const API_ROUTE = import.meta.env.VITE_LOCAL_API_ENDPOINT;
      try {
        const response = await axios.post(API_ROUTE + '/wfh-request/withdraw', {
          requestID,  // Send the request ID
          WFH_Date,   // Send the WFH date
        });
        this.successMessage = 'Withdrawal Request Sent Successfully';
        this.errorMessage = '';
        console.log(response);
      } catch (error) {
        console.log(error);
        this.errorMessage = 'Failed to send withdrawal request';
        this.successMessage = '';
      }
    },
    cancel() {
      // this.Request_Date = '';
      this.Request_Period = '';
      this.Reason = '';
      this.errorMessage = '';
      this.successMessage = '';
      this.$router.push('/staffRequestStatus');
    },

  },
  mounted() {
    this.fetchReportingManagerID();
    this.fetchStaffName();
    this.fetchStaffPosition();
    // this.fetchWFHDate();
    // this.fetchExistingRequestDates();
  },
};
</script>

<template>
  <div class="container mt-5">
    <form @submit.prevent="apply">
      <div class="form-group mb-3">
        <label for="staff_name">Name:</label>
        <input type="text" v-model="Staff_Name" id="staff__name" class="form-control" disabled />
      </div>
      <div class="form-group mb-3">
        <label for="position">Position:</label>
        <input type="text" v-model="Staff_Position" id="position" class="form-control" disabled />
      </div>
      <div class="form-group mb-3">
        <label for="request_date">WFH Date:</label>
        <input type="text" v-model="Request_Date" id="request_date" class="form-control" disabled />
      </div>
      <div class="form-group mb-3">
        <label for="request_period">Withdrawal Request Period:</label>
        <select v-model="Request_Period" id="request_period" class="form-control">
          <option value="AM">AM</option>
          <option value="PM">PM</option>
          <option value="Full-Day">Full-Day</option>
        </select>
      </div>
      <div class="form-group mb-3">
        <label for="reason">Reason for withdrawal:</label>
        <input type="text" v-model="Reason" id="reason" class="form-control" />
      </div>
      <div class="form-group mb-3">
        <label for="approver_name">Approver Name:</label>
        <input type="text" v-model="Approver_Name" id="approver_name" class="form-control" disabled />
      </div>
      <div v-if="errorMessage" class="alert alert-danger mb-3">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success mb-3">{{ successMessage }}</div>
      <button type="submit" class="btn btn-primary m-1">Submit</button>
      <button type="button" class="btn btn-secondary m-1" @click="cancel">Cancel</button>
    </form>
  </div>
</template>