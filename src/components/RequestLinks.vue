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
      this.$emit('linkChange', link); // Emit for parent component
    },
  },
};
</script>

<style scoped>
.links {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px solid #0d6fe5; /* Single line across all links */
  padding-bottom: 5px;
  position: relative; /* Make this relative to allow positioning of the blue line */
}

.link-container {
  text-align: center;
  flex: 1;
}

.link {
  color: #000000;
  font-weight: normal; /* Default weight for unselected links */
  text-decoration: none;
  padding-bottom: 5px;
  position: relative; /* Position relative for proper alignment of the active line */
}

.link.active {
  color: #000000; /* Active link color */
  font-weight: bold; /* Bold active link */
}

.link.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px; /* Place the blue line 6px below the text to align it under the border */
  height: 3px;
  background-color: #007bff; /* Blue underline for active link */
}

.link:hover {
  text-decoration: underline;
}
</style>
