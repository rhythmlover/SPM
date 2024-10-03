<script setup>
import { provide } from 'vue';
import { RouterView } from 'vue-router';
import StaffNavbar from './components/StaffNavbar.vue';
import ManagerNavbar from './components/ManagerNavbar.vue';
import {
  BNavbar,
  BNavbarBrand,
  BNavbarToggle,
  BCollapse,
  BContainer,
  BNavbarNav,
  BNavItem,
} from 'bootstrap-vue-next';

provide(
  'API_ROUTE',
  import.meta.env.DEV
    ? import.meta.env.VITE_LOCAL_API_ENDPOINT
    : import.meta.env.VITE_DEPLOYED_API_ENDPOINT,
);
</script>

<template>
  <div class="app-container">
    <!-- WILL REMOVE USERSTORE AND IMPLEMENT LOCAL STORAGE
    <ManagerNavbar v-if="userStore.userInfo.Role_ID == 1" />
    <StaffNavbar v-else-if="userStore.userInfo.Role_ID == 2" /> -->
    <StaffNavbar v-if="true" />
    <ManagerNavbar v-else-if="false" />
    <BNavbar v-else fixed="top" toggleable="lg" type="dark" variant="light" class="py-2">
      <BContainer>
        <BNavbarBrand to="/" class="fw-bold">WorkForce Portal</BNavbarBrand>
        <BNavbarToggle target="nav-collapse" />
        <BCollapse id="nav-collapse" is-nav>
          <BNavbarNav>
            <BNavItem to="/">Home</BNavItem>
            <BNavItem to="/staff">Staff</BNavItem>
            <BNavItem to="/test">Test</BNavItem>
            <BNavItem to="/staffMySchedule">My Schedule</BNavItem>
            <BNavItem to="/staffTeamSchedule">My Team's Schedule</BNavItem>
            <BNavItem to="/staffRequestStatus">All Requests</BNavItem>
            <BNavItem to="/applyArrangement">Apply</BNavItem>
          </BNavbarNav>
        </BCollapse>
      </BContainer>
    </BNavbar>
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
