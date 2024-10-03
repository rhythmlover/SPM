<script setup>
import { inject, ref, onMounted } from 'vue';
import axios from 'axios';
import ScheduleList from '@/components/staff/ScheduleList.vue';

const API_ROUTE = inject('API_ROUTE');
const myWFHRequests = ref({});

/**
 * Retrieve all of my WFH requests that have same date present in dateMap
 * @param dateMap map of dates
 */
const getWFHRequests = async () => {
  let dateMap = {};
  try {
    // Fetch requests
    // Hardcoded staffID for now after removing userstore, implement after local storage
    let res = await axios.get(API_ROUTE + '/wfh-request/user', {
      params: { staffID: 171015 },
    });

    for (let requestObj of res.data.results) {
      // Convert MySQL date into JS Date object and String representations
      let requestDateObj = new Date(requestObj['WFH_Date']);
      let requestDateString = requestDateObj.toLocaleDateString('en-CA');
      requestObj['WFH_Date'] = requestDateString;

      // Date created before?
      if (!(requestDateString in dateMap)) {
        dateMap[requestDateString] = [];
      }
      // Add into map
      dateMap[requestDateString].push(requestObj);
    }
  } catch (error) {
    console.error('getWFHRequests():', error);
  }

  return dateMap;
};

onMounted(async () => {
  let requestsMap = await getWFHRequests();
  myWFHRequests.value = requestsMap;
});
</script>

<template>
  <BContainer :style="{ marginTop: '100px' }">
    <BRow>
      <BCol>
        <ScheduleList :wfh-requests="myWFHRequests" />
      </BCol>
    </BRow>
  </BContainer>
</template>

<style></style>
