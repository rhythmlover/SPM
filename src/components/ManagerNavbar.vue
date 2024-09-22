<script setup></script>

<template>
  <BNavbar fixed="top" toggleable="lg" variant="primary" v-b-color-mode="'dark'">
    <BNavbarBrand to="/">Manager</BNavbarBrand>
    <BNavbarToggle target="nav-collapse" />
    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav>
        <BNavItem to="/">Home</BNavItem>
        <BNavItem to="/">My Schedule</BNavItem>
        <BNavItem to="/">All Requests</BNavItem>
      </BNavbarNav>
    </BCollapse>
  </BNavbar>
</template>

<style></style>
