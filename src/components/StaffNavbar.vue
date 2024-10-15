<script setup>
import {
  BNavbar,
  BNavbarBrand,
  BNavbarToggle,
  BCollapse,
  BContainer,
  BNavbarNav,
  BNavItem,
  BNavItemDropdown,
  BDropdownItem,
} from 'bootstrap-vue-next';
import { inject } from 'vue';
import router from '@/router';

const staffFName = inject('staffFName');
const roleID = inject('roleID');
const staffID = inject('staffID');

const logout = () => {
  localStorage.clear();
  roleID.value = null;
  staffID.value = null;
  staffFName.value = '';
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
    <BContainer>
      <BNavbarBrand class="fw-bold"> Staff Portal </BNavbarBrand>

      <BNavbarToggle target="nav-collapse" />

      <BCollapse id="nav-collapse" is-nav>
        <BNavbarNav>
          <BNavItem to="/">Home</BNavItem>
          <BNavItem to="/staff-myschedule">My Schedule</BNavItem>
          <BNavItem to="/staff-teamschedule">Team Schedule</BNavItem>
          <BNavItem to="/staff-requeststatus">All Requests</BNavItem>
          <BNavItem to="/apply-arrangement">Apply</BNavItem>
          <BNavItem to="/staff-approved-requests-withdrawal"
            >Withdrawal Application</BNavItem
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
    </BContainer>
  </BNavbar>
</template>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-size: 1.5rem;
}

.nav-link-custom {
  display: flex;
  align-items: center;
}

.nav-link-custom::after {
  margin-left: 0.5rem;
}

.user-dropdown :deep(.dropdown-toggle) {
  font-weight: bold;
}

.user-dropdown :deep(.dropdown-item) {
  display: flex;
  align-items: center;
}
</style>
