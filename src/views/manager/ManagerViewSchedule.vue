<script setup>
import { inject, ref, onMounted } from 'vue';
import axios from 'axios';
import ScheduleList from '@/components/staff/ScheduleList.vue';

const API_ROUTE = inject('API_ROUTE');
const wfhRequests = ref({});

/**
 * Retrieve all of my WFH requests that have same date present in dateMap
 * @param dateMap map of dates
 */
const getWFHRequests = async () => {
  let dateMap = {};
  let staffID = localStorage.getItem('staffID');

  try {
    // Fetch requests
    let res = await axios.get(
      API_ROUTE + '/wfh-request/my-subordinate-and-me-requests',
      {
        params: { staffID },
      },
    );

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
  wfhRequests.value = requestsMap;
});
</script>

<template>
  <BContainer>
    <BRow>
      <BCol>
        <ScheduleList :wfh-requests="wfhRequests" />
      </BCol>
    </BRow>
  </BContainer>
</template>

<style></style>
