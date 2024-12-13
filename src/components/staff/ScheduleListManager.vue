<script setup>
import { onMounted, computed } from 'vue';
import { formatDateFromStr, getRequestStatusPillColor } from '@/utils/utils';

const props = defineProps({
  wfhRequests: {
    type: Object,
    default() {
      return {};
    },
  },
});

const sortedWfhRequests = computed(() => {
  const sorted = JSON.parse(JSON.stringify(props.wfhRequests));
  for (const dateKey in sorted) {
    const dateObject = sorted[dateKey];
    if (dateObject.requests && dateObject.requests.length > 0) {
      dateObject.requests.sort(
        (a, b) => new Date(a.Request_Date) - new Date(b.Request_Date),
      );
    }
  }
  return sorted;
});

onMounted(() => {
  console.log(props.wfhRequests);
});
</script>

<template>
  <BContainer>
    <BRow>
      <BCol>
        <BRow
          v-for="(dateObject, dateKeyStr) in sortedWfhRequests"
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

              <!-- Office Count Table -->
              <BTableSimple
                v-if="dateObject.office_count_table"
                class="mb-3 text-center"
                small
              >
                <BThead>
                  <BTr>
                    <BTh>Type</BTh>
                    <BTh
                      v-for="header in dateObject.office_count_table.headers"
                      :key="header"
                      class="text-center"
                    >
                      {{ header }}
                    </BTh>
                  </BTr>
                </BThead>
                <BTbody>
                  <BTr>
                    <BTd>WFH:</BTd>
                    <BTd
                      v-for="(count, index) in dateObject.office_count_table
                        .counts"
                      :key="index"
                    >
                      {{ count }}
                    </BTd>
                  </BTr>
                  <BTr>
                    <BTd>In Office:</BTd>
                    <BTd
                      v-for="(count, index) in dateObject.inoffice_count_table
                        .counts"
                      :key="index"
                    >
                      {{ count }}
                    </BTd>
                  </BTr>
                </BTbody>
              </BTableSimple>

              <BTableSimple
                v-if="dateObject.requests && dateObject.requests.length > 0"
                hover
                caption-top
              >
                <BThead head-variant="dark">
                  <BTr>
                    <BTh class="col-3">Name</BTh>
                    <BTh class="col-3">Position</BTh>
                    <BTh class="col-3">WFH Period</BTh>
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
                        :variant="
                          getRequestStatusPillColor(requestObj['Status'])
                        "
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
