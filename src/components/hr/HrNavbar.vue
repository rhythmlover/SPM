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
    <BNavbarBrand class="fw-bold">HR Portal</BNavbarBrand>

    <BNavbarToggle target="nav-collapse" />

    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav pills>
        <BNavItem
          :class="highlightedNavItemStyle('hr-view-schedule')"
          to="/hr-view-schedule"
          >Team Schedule</BNavItem
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
