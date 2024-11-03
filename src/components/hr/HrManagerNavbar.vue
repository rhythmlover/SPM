<script setup>
import {
  BNavbar,
  BNavbarBrand,
  BNavbarToggle,
  BCollapse,
  BNavbarNav,
  BNavItem,
  BNavItemDropdown,
  BDropdownItem,
} from 'bootstrap-vue-next';
import { inject } from 'vue';
import router from '@/router';
import { highlightedNavItemStyle } from '@/utils/utils';

const staffFName = inject('staffFName');
const roleID = inject('roleID');
const staffID = inject('staffID');
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
    <BNavbarBrand class="fw-bold">HR Manager Portal</BNavbarBrand>

    <BNavbarToggle target="nav-collapse" />

    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav pills>
        <BNavItem
          :class="highlightedNavItemStyle('hr-view-schedule')"
          to="/hr-view-schedule"
          >HR Schedule</BNavItem
        >
        <BNavItem
          :class="highlightedNavItemStyle('staff-myschedule')"
          to="/staff-myschedule"
          >My Schedule</BNavItem
        >
        <BNavItem
          :class="highlightedNavItemStyle('manager-view-schedule')"
          to="/manager-view-schedule"
          >My Team's Schedule</BNavItem
        >
        <BNavItem
          :class="highlightedNavItemStyle('pending-requests')"
          to="/pending-requests"
          >View Requests</BNavItem
        >
        <BNavItem
          :class="highlightedNavItemStyle('staff-requeststatus')"
          to="/staff-requeststatus"
          >My Requests</BNavItem
        >
        <BNavItem
          :class="highlightedNavItemStyle('apply-arrangement')"
          to="/apply-arrangement"
          >Apply</BNavItem
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
