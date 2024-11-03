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
const staffDepartment = ref('');

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
provide('staffDepartment', staffDepartment);

onMounted(() => {
  roleID.value = localStorage.roleID ? parseInt(localStorage.roleID) : null;
  staffID.value = localStorage.staffID ? parseInt(localStorage.staffID) : null;
  staffFName.value = localStorage.staffFName ? localStorage.staffFName : '';
  staffPosition.value = localStorage.staffPosition
    ? localStorage.staffPosition
    : '';
  staffDepartment.value = localStorage.staffDepartment
    ? parseInt(localStorage.staffDepartment)
    : null;
});

const getPosition = () => {
  if (staffDepartment.value == 5 && staffPosition.value.includes('Director')) {
    return 'hr director';
  } else if (staffDepartment.value == 5) {
    return 'hr';
  } else if (
    staffPosition.value.includes('Manager') ||
    staffPosition.value.includes('Director') ||
    staffPosition.value.includes('MD')
  ) {
    return 'manager';
  }
  return 'staff';
};
</script>

<template>
  <div class="app-container">
    <div v-if="staffPosition == ''"></div>
    <ManagerNavbar v-else-if="getPosition() == 'manager'" />
    <HrNavbar v-else-if="getPosition() == 'hr'" />
    <HrManagerNavbar v-else-if="getPosition() == 'hr director'" />
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
