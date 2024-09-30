<script setup>
// import { useUserStore } from '@/stores/user';
import ScheduleList from '@/components/staff/ScheduleList.vue';

// const userStore = useUserStore();
</script>

<template>
  <BContainer :style="{ marginTop: '100px' }">
    <BRow>
      <BCol>
        <ScheduleList :staff-id="171015" :is-staff-view="true" />
      </BCol>
    </BRow>
  </BContainer>
</template>

<style></style>
