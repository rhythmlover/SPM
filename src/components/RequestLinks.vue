<template>
  <div class="links">
    <div class="link-container">
      <router-link
        to="/pending-requests"
        class="link"
        :class="{ active: isActive('/incoming-requests') }"
        @click.prevent="setActiveLink('/incoming-requests')"
      >
        Incoming Requests
      </router-link>
    </div>
    <div class="link-container">
      <router-link
        to="/pending-requests"
        class="link"
        :class="{ active: isActive('/previously-accepted') }"
        @click.prevent="setActiveLink('/previously-accepted')"
      >
        Previously Accepted
      </router-link>
    </div>
    <div class="link-container">
      <router-link
        to="/pending-requests"
        class="link"
        :class="{ active: isActive('/previously-rejected') }"
        @click.prevent="setActiveLink('/previously-rejected')"
      >
        Previously Rejected
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequestLinks',
  data() {
    return {
      activeLink: '/incoming-requests',
    };
  },
  methods: {
    isActive(link) {
      return this.activeLink === link;
    },
    setActiveLink(link) {
      this.activeLink = link;
      this.$emit('linkChange', link);
    },
  },
};
</script>

<style scoped>
.links {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px solid #0d6fe5;
  /* Single line across all links */
  padding-bottom: 5px;
}

.link-container {
  text-align: center;
  flex: 1;
}

.link {
  color: #007bff;
  font-weight: bold;
  text-decoration: none;
}

.link.active {
  color: #28a745;
  border-bottom: 2px solid #28a745;
}

.link:hover {
  text-decoration: underline;
}
</style>
