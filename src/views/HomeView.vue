<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { BContainer, BRow, BCol, BFormInput } from 'bootstrap-vue-next';

const router = useRouter();
const employeeID = ref('');

const login = async () => {
  try {
    let API_ROUTE = import.meta.env.VITE_LOCAL_API_ENDPOINT;
    const res = await axios.get(API_ROUTE + '/employee/login', {
      params: { userID: employeeID.value },
    });
    console.log('Staff details:', res.data);
  } catch (error) {
    console.error(error);
    return;
  }

  if (employeeID.value == '171015') {
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
