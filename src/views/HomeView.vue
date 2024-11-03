<script setup>
import axios from 'axios';
import { inject, onMounted, ref } from 'vue';
import { BContainer, BRow, BCol, BFormInput } from 'bootstrap-vue-next';
import router from '@/router';

const employeeID = ref('');
const API_ROUTE = inject('API_ROUTE');
const roleID = inject('roleID');
const staffID = inject('staffID');
const staffFName = inject('staffFName');
const staffPosition = inject('staffPosition');
const staffDepartment = inject('staffDepartment');
const errorMessage = ref('');
const showErrorModal = ref(false);

const redirectRoute = async () => {
  /**
   * Checking just the Role_ID does not work, as it is not consistent (Jack Sim having 1, Other managers having 2)
   * Detect "Manager" or "Director" in their Position then means Manager / Director?
   **/
  let position = localStorage.getItem('staffPosition') || '';
  if (position == '') return;
  // Manager / Director / MD
  if (
    position.includes('Manager') ||
    position.includes('Director') ||
    position.includes('MD')
  ) {
    router.push('/manager-view-schedule');
  }
  // HR
  else if (position.includes('HR')) {
    // 160065, John Tan
    router.push('/hr-view-schedule');
  }
  // Everyone else
  else {
    router.push('/staff-myschedule');
  }
};

const login = async () => {
  try {
    const res = await axios.get(`${API_ROUTE}/employee/login`, {
      params: { staffID: employeeID.value },
    });

    localStorage.setItem('staffID', res.data.Staff_ID);
    localStorage.setItem('roleID', res.data.Role_ID);
    localStorage.setItem('staffFName', res.data.Staff_FName);
    localStorage.setItem('staffPosition', res.data.Position);
    localStorage.setItem('staffDepartment', res.data.Dept_ID);

    roleID.value = res.data.Role_ID;
    staffID.value = res.data.Staff_ID;
    staffFName.value = res.data.Staff_FName;
    staffPosition.value = res.data.Position;
    staffDepartment.value = res.data.Dept_ID;
    // Re-route
    redirectRoute();

    // Check expired requests
    try {
      const staffIDValue = res.data.Staff_ID;
      await axios.put(`${API_ROUTE}/wfh-request/removeExpiredRequests`, {
        staffID: staffIDValue,
      });
    } catch (error) {
      console.error(
        'Error updating expired pending requests to rejected:',
        error,
      );
    }
  } catch (error) {
    errorMessage.value = 'Invalid Employee ID';
    showErrorModal.value = true;
    console.error('Login error:', error);
  }
};

onMounted(() => {
  redirectRoute();
});
</script>

<template>
  <div class="main">
    <BContainer>
      <BRow>
        <BCol> </BCol>
        <BCol>
          <BFormInput
            v-model="employeeID"
            placeholder="Enter your Employee ID"
          />
          <div class="d-grid">
            <BButton
              @click="login"
              :disabled="employeeID == ''"
              block
              variant="success"
              class="mt-2"
              >Submit</BButton
            >
          </div>
        </BCol>
        <BCol> </BCol>
      </BRow>
    </BContainer>
    <BModal v-model="showErrorModal" title="Error" hide-footer centered>
      <div class="d-block">
        {{ errorMessage }}
      </div>
      <template #modal-footer>
        <BButton variant="primary" @click="showErrorModal = false"
          >Close</BButton
        >
      </template>
    </BModal>
  </div>
</template>

<style scoped>
.main {
  min-height: 80vh;
  display: flex;
  align-items: center;
}
</style>
