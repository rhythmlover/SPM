<script setup>
import { provide } from 'vue';
import { RouterView } from 'vue-router';
import StaffNavbar from './components/StaffNavbar.vue';
import ManagerNavbar from './components/ManagerNavbar.vue';
import { useUserStore } from '@/stores/user';
// const route = useRoute();

const userStore = useUserStore();
provide(
  'API_ROUTE',
  import.meta.env.DEV
    ? import.meta.env.VITE_LOCAL_API_ENDPOINT
    : import.meta.env.VITE_DEPLOYED_API_ENDPOINT,
);
</script>

<template>
  <ManagerNavbar v-if="userStore.userInfo.Role_ID == 1" />
  <StaffNavbar v-else-if="userStore.userInfo.Role_ID == 2" />
  <nav v-else>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/staff">Staff</RouterLink>
    <RouterLink to="/test">Test</RouterLink>
    <RouterLink to="/staffMySchedule">My Schedule</RouterLink>
    <RouterLink to="/staffTeamSchedule">My Team's Schedule</RouterLink>
    <RouterLink to="/staffRequestStatus">All Requests</RouterLink>
    <RouterLink to="/applyArrangement">Apply</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped></style>
