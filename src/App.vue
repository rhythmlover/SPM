<script setup>
import { provide, ref, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import StaffNavbar from './components/staff/StaffNavbar.vue';
import ManagerNavbar from './components/ManagerNavbar.vue';
import HrNavbar from './components/hr/HrNavbar.vue';

const roleID = ref(null);
const staffID = ref(null);
const staffFName = ref('');
const staffPosition = ref('');

provide(
  'API_ROUTE',
  import.meta.env.DEV
    ? import.meta.env.VITE_LOCAL_API_ENDPOINT
    : import.meta.env.VITE_DEPLOYED_API_ENDPOINT,
);

provide('roleID', roleID);
provide('staffID', staffID);
provide('staffFName', staffFName);
provide('staffPosition', staffPosition);

onMounted(() => {
  roleID.value = localStorage.roleID ? parseInt(localStorage.roleID) : null;
  staffID.value = localStorage.staffID ? parseInt(localStorage.staffID) : null;
  staffFName.value = localStorage.staffFName ? localStorage.staffFName : '';
  staffPosition.value = localStorage.staffPosition
    ? localStorage.staffPosition
    : '';
});

const getPosition = () => {
  if (
    staffPosition.value.includes('Manager') ||
    staffPosition.value.includes('Director') ||
    staffPosition.value.includes('MD')
  ) {
    return 'manager';
  } else if (staffPosition.value.includes('HR')) {
    return 'hr';
  }
  return 'staff';
};
</script>

<template>
  <div class="app-container">
    <div v-if="staffPosition == ''"></div>
    <ManagerNavbar v-else-if="getPosition() == 'manager'" />
    <HrNavbar v-else-if="getPosition() == 'hr'" />
    <StaffNavbar v-else />
    <main class="">
      <div class="navbar-spacing"></div>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.navbar-spacing {
  height: 130px;
}
</style>
