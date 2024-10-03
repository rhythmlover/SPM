<script setup>
import { provide, ref, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import StaffNavbar from './components/StaffNavbar.vue';
import ManagerNavbar from './components/ManagerNavbar.vue';

const roleID = ref(null);
const staffID = ref(null);
const staffFName = ref('');

provide(
  'API_ROUTE',
  import.meta.env.DEV
    ? import.meta.env.VITE_LOCAL_API_ENDPOINT
    : import.meta.env.VITE_DEPLOYED_API_ENDPOINT,
);

provide('roleID', roleID);
provide('staffID', staffID);
provide('staffFName', staffFName);

onMounted(() => {
  roleID.value = localStorage.roleID ? parseInt(localStorage.roleID) : null;
  staffID.value = localStorage.staffID ? parseInt(localStorage.staffID) : null;
  staffFName.value = localStorage.staffFName ? localStorage.staffFName : '';
});
</script>

<template>
  <div class="app-container">
    <ManagerNavbar v-if="roleID == 1" />
    <StaffNavbar v-else />
    <main class="mt-5 pt-3">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

main {
  padding: 20px;
}
</style>
