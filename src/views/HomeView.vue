<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { BContainer, BRow, BCol, BFormInput, BButton } from 'bootstrap-vue-next';

const router = useRouter();
import { inject, ref } from 'vue';
import { BContainer, BRow, BCol, BFormInput } from 'bootstrap-vue-next';
import router from '@/router';

const employeeID = ref('');
const API_ROUTE = inject('API_ROUTE');
const roleID = inject('roleID');
const staffID = inject('staffID');
const staffFName = inject('staffFName');

const login = async () => {
  const res = await axios.get(`${API_ROUTE}/employee/login`, {
    params: { staffID: employeeID.value },
  });
  localStorage.setItem('staffID', res.data.Staff_ID);
  localStorage.setItem('roleID', res.data.Role_ID);
  localStorage.setItem('staffFName', res.data.Staff_FName);

  roleID.value = res.data.Role_ID;
  staffID.value = res.data.Staff_ID;
  staffFName.value = res.data.Staff_FName;

  if (res.data.Role_ID === 1) {
    router.push('/pending-requests');
  } else {
    router.push('/staffmyschedule');
  }
};
</script>

<template>
  <div class="main">
    <BContainer>
      <BRow>
        <BCol> </BCol>
        <BCol>
          <BFormInput v-model="employeeID" placeholder="Enter your Employee ID" />
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
  </div>
</template>

<style scoped>
.main {
  min-height: 80vh;
  display: flex;
  align-items: center;
}
</style>
