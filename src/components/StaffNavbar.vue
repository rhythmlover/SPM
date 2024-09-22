<script setup></script>

<template>
  <BNavbar fixed="top" toggleable="lg" variant="primary" v-b-color-mode="'dark'">
    <BNavbarBrand to="/staffmyschedule">Staff</BNavbarBrand>
    <BNavbarToggle target="nav-collapse" />
    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav>
        <BNavItem to="/staffmyschedule">My Schedule</BNavItem>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<style></style>
