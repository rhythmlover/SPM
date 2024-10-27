<script setup>
import { inject, ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { usePeriodChange } from '@/components/usePeriodChange';
import ScheduleList from '@/components/staff/ScheduleListManager.vue';
import ScheduleFilters from '@/components/ScheduleFilters.vue';

const API_ROUTE = inject('API_ROUTE');
const subordinateHierarchy = ref(null);
const managerSubordinates = ref(null);
const allRequests = ref([]);
const isLoading = ref(true);
const isMonthView = ref(true);
const todayDate = ref(new Date());

// Add total team count
const totalTeamCount = ref(0);

const {
  datesInPeriod,
  currentPeriodString,
  getAbleToShiftPeriod,
  shiftPeriod,
} = usePeriodChange({
  todayDate: todayDate,
  isMonthView: isMonthView,
});

// Filter-related refs
const statusOptions = ref([
  { value: 'Approved', text: 'Approved' },
  { value: 'Pending', text: 'Pending' },
  { value: 'Rejected', text: 'Rejected' },
  { value: 'Withdrawn', text: 'Withdrawn' },
  { value: 'Withdrawal Pending', text: 'Withdrawal Pending' },
]);
const selectedStatuses = ref([]);
const wfhTimeOptions = ref([
  { value: 'FULL', text: 'Full Day' },
  { value: 'AM', text: 'AM' },
  { value: 'PM', text: 'PM' },
]);
const selectedWfhTimes = ref([]);
const selectedManager = ref('');

// Flattened hierarchy map
const flattenedHierarchy = ref(new Map());

// Function to calculate WFH personnel counts
const calculateWFHCount = (requests, totalCount) => {
  const wfhCounts = {
    AM: new Set(),
    PM: new Set(),
    FULL: new Set(),
  };

  // Count unique employees WFH for each period
  requests.forEach(request => {
    // Include both Approved and Pending statuses
    if (request.Status === 'Approved' || request.Status === 'Pending') {
      wfhCounts[request.Request_Period].add(request.Staff.Staff_ID);
    }
  });

  // Return the WFH counts
  return {
    AM: wfhCounts.AM.size,
    PM: wfhCounts.PM.size,
    FULL: wfhCounts.FULL.size,
  };
};

const updateAllSubordinateWFH = async () => {
  isLoading.value = true;
  let Staff_ID = localStorage.getItem('staffID');

  try {
    // Fetch subordinateHierarchy
    let resHierarchy = await axios.get(API_ROUTE + '/teamlist/subordinateHierarchy', {
      params: { Staff_ID },
    });
    subordinateHierarchy.value = resHierarchy.data;

    // Fetch managerSubordinates
    let resManagerSubordinates = await axios.get(API_ROUTE + '/teamlist/managerSubordinates', {
      params: { Staff_ID },
    });
    managerSubordinates.value = resManagerSubordinates.data;

    // Calculate total team count from subordinates
    totalTeamCount.value = countAllSubordinates(managerSubordinates.value) + 1; // +1 for the manager themselves

    // Populate allRequests
    allRequests.value = subordinateHierarchy.value.subordinates.flatMap(
      (subordinate) =>
        subordinate.wfhRequests.map((request) => ({
          ...request,
          Staff: {
            Staff_ID: subordinate.Staff_ID,
            Staff_FName: subordinate.Staff_FName,
            Staff_LName: subordinate.Staff_LName,
            Position: subordinate.position,
            Reporting_Manager: subordinate.Reporting_Manager,
          },
        })),
    );

    // Create flattened hierarchy
    createFlattenedHierarchy(managerSubordinates.value);
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Function to count all subordinates recursively
const countAllSubordinates = (manager) => {
  if (!manager || !manager.subordinates) return 0;
  
  return manager.subordinates.reduce((count, sub) => {
    return count + 1 + countAllSubordinates(sub);
  }, 0);
};

// Function to create flattened hierarchy
const createFlattenedHierarchy = (manager) => {
  const subordinates = new Set();
  
  const addSubordinates = (subs) => {
    for (const sub of subs) {
      subordinates.add(sub.Staff_ID);
      if (sub.subordinates) {
        addSubordinates(sub.subordinates);
      }
    }
  };
  
  addSubordinates(manager.subordinates);
  flattenedHierarchy.value.set(manager.Staff_ID, subordinates);
  
  for (const sub of manager.subordinates) {
    if (sub.subordinates) {
      createFlattenedHierarchy(sub);
    }
  }
};

const filteredDates = computed(() => {
  const filtered = {};

  Object.entries(datesInPeriod.value).forEach(([date, dayInfo]) => {
    const filteredRequests = allRequests.value.filter((request) => {
      const dateMatch = new Date(request.WFH_Date).toLocaleDateString('en-CA') === date;
      const statusMatch = selectedStatuses.value.includes(request.Status);
      const timeMatch = selectedWfhTimes.value.includes(request.Request_Period);
      const managerMatch = !selectedManager.value || 
        selectedManager.value === request.Staff.Staff_ID ||
        (flattenedHierarchy.value.get(selectedManager.value) && 
         flattenedHierarchy.value.get(selectedManager.value).has(request.Staff.Staff_ID));

      return dateMatch && statusMatch && timeMatch && managerMatch;
    });

    // Calculate WFH counts for the day
    const wfhCounts = calculateWFHCount(filteredRequests, totalTeamCount.value);

    filtered[date] = { 
      ...dayInfo,
      requests: filteredRequests,
      office_count_table: {
        headers: ['AM', 'PM', 'FULL'],
        counts: [
          `${wfhCounts.AM}/${totalTeamCount.value}`,
          `${wfhCounts.PM}/${totalTeamCount.value}`,
          `${wfhCounts.FULL}/${totalTeamCount.value}`
        ]
      }
    };
  });
  
  return filtered;
});

const managerOptions = computed(() => {
  if (!managerSubordinates.value) return [];
  
  const extractManagers = (subordinates, depth = 0) => {
    let managers = [];
    for (let sub of subordinates) {
      managers.push({ 
        value: sub.Staff_ID, 
        text: `${sub.Staff_FName} ${sub.Staff_LName}`,
        depth: depth
      });
      if (sub.subordinates) {
        managers = managers.concat(extractManagers(sub.subordinates, depth + 1));
      }
    }
    return managers;
  };

  return [
    { 
      value: managerSubordinates.value.Staff_ID, 
      text: `${managerSubordinates.value.Staff_FName} ${managerSubordinates.value.Staff_LName}`,
      depth: 0 
    },
    ...extractManagers(managerSubordinates.value.subordinates, 1)
  ];
});

onMounted(async () => {
  await updateAllSubordinateWFH();
});
</script>

<template>
  <BContainer>
    <BRow>
      <BCol>
        <BContainer>
          <BRow class="mb-4 align-items-center">
            <BCol class="d-flex justify-content-center">
              <BButton
                :disabled="!getAbleToShiftPeriod(-1)[0]"
                @click="shiftPeriod(-1)"
                variant="outline-primary"
                >Previous</BButton
              >
            </BCol>
            <BCol class="text-center">
              <h2>{{ currentPeriodString }}</h2>
              <div class="text-muted">Total Team Size: {{ totalTeamCount }}</div>
            </BCol>
            <BCol class="d-flex justify-content-center">
              <BButton
                :disabled="!getAbleToShiftPeriod(1)[0]"
                @click="shiftPeriod(1)"
                variant="outline-primary"
                >Next</BButton
              >
            </BCol>
          </BRow>

          <!-- Filters -->
          <ScheduleFilters
            v-model:isMonthView="isMonthView"
            v-model:selectedStatuses="selectedStatuses"
            v-model:selectedWfhTimes="selectedWfhTimes"
            v-model:selectedManager="selectedManager"
            :statusOptions="statusOptions"
            :wfhTimeOptions="wfhTimeOptions"
            :managerOptions="managerOptions"
          />
        </BContainer>

        <BOverlay :show="isLoading" rounded="sm">
          <ScheduleList :wfh-requests="filteredDates" />
        </BOverlay>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style scoped>
.custom-bg-dropdown {
  background-color: #e0e0e0 !important;
  border: 1px solid #d3d3d3 !important;
}

.custom-bg-dropdown .dropdown-item {
  background-color: #e0e0e0 !important;
}

.custom-bg-dropdown .dropdown-item:hover {
  background-color: #d3d3d3 !important;
}
</style>