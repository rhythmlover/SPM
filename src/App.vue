<script setup>
import { provide, ref, onMounted, computed } from 'vue';
import { RouterView } from 'vue-router';
import StaffNavbar from './components/staff/StaffNavbar.vue';
import ManagerNavbar from './components/ManagerNavbar.vue';

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

const isManager = computed(() => {
  return (
    staffPosition.value.includes('Manager') ||
    staffPosition.value.includes('Director') ||
    staffPosition.value.includes('MD')
  );
});
</script>

<template>
  <div class="app-container">
    <div v-if="staffPosition == ''"></div>
    <ManagerNavbar v-else-if="isManager" />
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
