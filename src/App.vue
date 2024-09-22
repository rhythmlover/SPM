<script setup>
import { RouterLink, RouterView } from 'vue-router';

// const route = useRoute();
</script>

<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/staff">Staff</RouterLink>
    <RouterLink to="/test">Test</RouterLink>
    <RouterLink to="/staffMySchedule">My Schedule</RouterLink>
    <RouterLink to="/staffTeamSchedule">My Team's Schedule</RouterLink>
    <RouterLink to="/staffRequestStatus">All Requests</RouterLink>
  </nav>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
}

nav a.router-link-exact-active {
  background-color: var(--color-border);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;
  }
}
</style>
