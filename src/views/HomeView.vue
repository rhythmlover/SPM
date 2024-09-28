<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { BContainer, BRow, BCol, BFormInput } from 'bootstrap-vue-next';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const store = useStore();
const employeeID = ref('');

const login = async () => {
  try {
    let API_ROUTE = import.meta.env.DEV
      ? import.meta.env.VITE_LOCAL_API_ENDPOINT
      : import.meta.env.VITE_DEPLOYED_API_ENDPOINT;
    const res = await axios.get(API_ROUTE + '/employee/login', {
      params: { staffID: employeeID.value },
    });
    console.log('Staff details:', res.data);
    // Set userStore
    userStore.setUserInfo(res.data);
    store.dispatch('setStaffID', res.data);
  } catch (error) {
    console.error(error);
    return;
  }

  // Checking just the Role_ID does not work, as it is not consistent (Jack Sim having 1, Other managers having 2)
  // Could we just detect the word "Manager" or "Director" then means Manager? Then edit the Role_ID to fit their actual role...

  // Reroute based on role
  if (userStore.userInfo.Role_ID == 1) {
    // HR
    router.replace({ path: '/staff' });
  } else if (userStore.userInfo.Role_ID == 2) {
    // Staff
    router.replace({ path: '/staffmyschedule' });
  } else {
    // Manager
    router.replace({ path: '/staff' });
  }
};

// onMounted(() => {
//   console.log(`The`);
// });
</script>

<template>
  <div class="main">
    <BContainer>
      <BRow>
        <BCol> </BCol>
        <BCol>
          <BFormInput v-model="employeeID" placeholder="Enter your Employee ID" />
          <div class="d-grid">
            <BButton
              @click="login"
              :disabled="employeeID == ''"
              block
              variant="success"
              class="mt-2"
              >Submit</BButton
            >
          </div>
        </BCol>
        <BCol> </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<style scoped>
.main {
  min-height: 80vh;
  display: flex;
  align-items: center;
}
</style>
