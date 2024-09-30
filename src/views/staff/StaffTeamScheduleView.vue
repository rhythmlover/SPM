<!-- StaffScheduleView.vue -->
<template>
  <b-container>
    <b-row class="my-4">
      <b-col>
        <h1 class="text-center">Staff Team Schedule</h1>
      </b-col>
    </b-row>
    <StaffTeamSchedule />
  </b-container>
</template>

<script>
import StaffTeamSchedule from '../../components/StaffTeamSchedule.vue';

export default {
  name: 'StaffScheduleView',
  components: {
    StaffTeamSchedule
  }
};
</script>