<script setup>
import { onMounted } from 'vue';

const props = defineProps({
  wfhRequests: {
    type: Object,
    default() {
      return {};
    },
  },
});

const formatDateFromStr = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusPillColor = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
    case 'withdrawal pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
};

onMounted(() => {
  console.log(props.wfhRequests);
});
</script>

<template>
  <BContainer>
    <BRow>
      <BCol>
        <BRow
          v-for="(dateObject, dateKeyStr) in wfhRequests"
          :key="dateKeyStr"
          class="mb-4"
        >
          <BCol>
            <BCard>
              <template #header>
                <h4 class="mb-0">
                  {{ formatDateFromStr(dateKeyStr) }}
                </h4>
              </template>
              <BTableSimple
                v-if="dateObject.requests && dateObject.requests.length > 0"
                hover
                caption-top
              >
                <BThead head-variant="dark">
                  <BTr>
                    <BTh class="col-3">Name</BTh>
                    <BTh class="col-3">Position</BTh>
                    <BTh class="col-3">WFH Time</BTh>
                    <BTh class="col-3">Status</BTh>
                  </BTr>
                </BThead>
                <BTbody>
                  <BTr
                    v-for="requestObj in dateObject.requests"
                    :key="requestObj.Request_ID"
                  >
                    <BTd>
                      {{
                        `${requestObj.Staff.Staff_FName} ${requestObj.Staff.Staff_LName}`
                      }}
                    </BTd>
                    <BTd>{{ requestObj.Staff.Position }}</BTd>
                    <BTd>{{ requestObj.Request_Period }}</BTd>
                    <BTd>
                      <BBadge
                        :variant="getStatusPillColor(requestObj.Status)"
                        pill
                      >
                        {{ requestObj.Status }}
                      </BBadge>
                    </BTd>
                  </BTr>
                </BTbody>
              </BTableSimple>
              <p v-else>No WFH requests for this day</p>
            </BCard>
          </BCol>
        </BRow>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style scoped></style>
