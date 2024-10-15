<script setup>
import { inject } from 'vue';
import router from '@/router';
import { highlightedNavItemStyle } from '@/utils/highlightedNavItemStyle';

const roleID = inject('roleID');
const staffID = inject('staffID');
const staffFName = inject('staffFName');
const staffPosition = inject('staffPosition');

const logout = () => {
  localStorage.clear();
  roleID.value = null;
  staffID.value = null;
  staffFName.value = '';
  staffPosition.value = '';
  router.push('/');
};
</script>

<template>
  <BNavbar
    fixed="top"
    toggleable="lg"
    type="dark"
    variant="primary"
    class="py-2"
  >
    <BNavbarBrand class="fw-bold">Manager Portal</BNavbarBrand>
    <BNavbarToggle target="nav-collapse" />

    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav>
        <BNavItem
          :class="highlightedNavItemStyle('manager-view-schedule')"
          to="/manager-view-schedule"
          >Team's Schedule</BNavItem
        >
        <BNavItem
          :class="highlightedNavItemStyle('pending-requests')"
          to="/pending-requests"
          >View Requests</BNavItem
        >
      </BNavbarNav>

      <BNavbarNav class="ms-auto">
        <BNavItemDropdown
          :text="`Welcome ${staffFName}!`"
          class="user-dropdown"
        >
          <BDropdownItem @click="logout"> Logout </BDropdownItem>
        </BNavItemDropdown>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<style scoped></style>
