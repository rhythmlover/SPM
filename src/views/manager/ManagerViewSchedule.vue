<script setup>
import { inject, ref, computed, onMounted, watch } from 'vue';
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
const totalTeamCount = ref(0);
const originalTotalTeamCount = ref(0);

// Filter-related refs
const statusOptions = ref([
  { value: 'Approved', text: 'Approved' },
  { value: 'Pending', text: 'Pending' },
  { value: 'Rejected', text: 'Rejected' },
  { value: 'Withdrawn', text: 'Withdrawn' },
  { value: 'Withdrawal Pending', text: 'Withdrawal Pending' },
  { value: 'Cancelled', text: 'Cancelled' },
]);
const selectedStatuses = ref([]);
const wfhTimeOptions = ref([
  { value: 'FULL', text: 'Full Day' },
  { value: 'AM', text: 'AM' },
  { value: 'PM', text: 'PM' },
]);
const selectedWfhTimes = ref([]);
const selectedManager = ref('');

const {
  datesInPeriod,
  currentPeriodString,
  getAbleToShiftPeriod,
  shiftPeriod,
} = usePeriodChange({
  todayDate: todayDate,
  isMonthView: isMonthView,
});

// Ref to store all approved requests for counting
const allApprovedRequests = ref([]);

// Calculate WFH counts based on all approved requests for a specific date
// Modify the calculateWFHCount function to also return in-office counts
const calculateWFHCount = (date) => {
  const wfhCounts = {
    AM: new Set(),
    PM: new Set(),
    FULL: new Set(),
  };

  const staffAm = new Set();
  const staffPm = new Set();

  allApprovedRequests.value
    .filter((request) => {
      const requestDate = new Date(request.WFH_Date).toLocaleDateString(
        'en-CA',
      );
      return requestDate === date;
    })
    .forEach((request) => {
      if (
        request.Status === 'Approved' ||
        request.Status === 'Withdrawal Pending'
      ) {
        if (request.Request_Period === 'FULL') {
          wfhCounts.AM.add(request.Staff.Staff_ID);
          wfhCounts.PM.add(request.Staff.Staff_ID);
          wfhCounts.FULL.add(request.Staff.Staff_ID);
        } else if (request.Request_Period === 'AM') {
          staffAm.add(request.Staff.Staff_ID);
          wfhCounts.AM.add(request.Staff.Staff_ID);
        } else if (request.Request_Period === 'PM') {
          staffPm.add(request.Staff.Staff_ID);
          wfhCounts.PM.add(request.Staff.Staff_ID);
        }
      }
    });

  staffAm.forEach((staffId) => {
    if (staffPm.has(staffId)) {
      wfhCounts.FULL.add(staffId);
    }
  });

  // number of staff in office for FULL should be count of staff with no requests for the day
  // but can get min number of inofficecount for AM/PM as well?
  const inOfficeFull =
    originalTotalTeamCount.value - wfhCounts.AM.size <
    originalTotalTeamCount.value - wfhCounts.PM.size
      ? originalTotalTeamCount.value - wfhCounts.AM.size
      : originalTotalTeamCount.value - wfhCounts.PM.size;

  // Calculate in-office counts (total team - WFH count)
  const inOfficeCounts = {
    AM: originalTotalTeamCount.value - wfhCounts.AM.size,
    PM: originalTotalTeamCount.value - wfhCounts.PM.size,
    FULL: inOfficeFull,
  };

  return {
    wfhCounts: {
      AM: `${wfhCounts.AM.size}/${originalTotalTeamCount.value}`,
      PM: `${wfhCounts.PM.size}/${originalTotalTeamCount.value}`,
      FULL: `${wfhCounts.FULL.size}/${originalTotalTeamCount.value}`,
    },
    inOfficeCounts: {
      AM: `${inOfficeCounts.AM}/${originalTotalTeamCount.value}`,
      PM: `${inOfficeCounts.PM}/${originalTotalTeamCount.value}`,
      FULL: `${inOfficeCounts.FULL}/${originalTotalTeamCount.value}`,
    },
  };
};

// Update the filteredDates computed property
const filteredDates = computed(() => {
  const filtered = {};

  Object.entries(datesInPeriod.value).forEach(([date, dayInfo]) => {
    const filteredRequests = allRequests.value.filter((request) => {
      const dateMatch =
        new Date(request.WFH_Date).toLocaleDateString('en-CA') === date;
      const statusMatch =
        selectedStatuses.value.length === 0 ||
        selectedStatuses.value.includes(request.Status);
      const timeMatch =
        selectedWfhTimes.value.length === 0 ||
        selectedWfhTimes.value.includes(request.Request_Period);

      return dateMatch && statusMatch && timeMatch;
    });

    const counts = calculateWFHCount(date);

    filtered[date] = {
      ...dayInfo,
      requests: filteredRequests,
      office_count_table: {
        headers: ['AM', 'PM', 'FULL'],
        counts: counts.wfhCounts, // WFH counts
      },
      inoffice_count_table: {
        headers: ['AM', 'PM', 'FULL'],
        counts: counts.inOfficeCounts, // In-office counts
      },
    };
  });

  return filtered;
});

const updateAllSubordinateWFH = async (managerId = null) => {
  isLoading.value = true;
  let Staff_ID = managerId || localStorage.getItem('staffID');

  try {
    // Fetch subordinateHierarchy for the selected manager
    let resHierarchy = await axios.get(
      `${API_ROUTE}/teamlist/subordinateHierarchy`,
      {
        params: { Staff_ID },
      },
    );
    subordinateHierarchy.value = resHierarchy.data;

    // Only fetch managerSubordinates if loading initially or changing the root manager
    if (!managerId) {
      let resManagerSubordinates = await axios.get(
        `${API_ROUTE}/teamlist/managerSubordinates`,
        {
          params: { Staff_ID },
        },
      );
      managerSubordinates.value = resManagerSubordinates.data;
    }

    // Calculate total team count and store original count
    totalTeamCount.value = countAllSubordinates(subordinateHierarchy.value);
    originalTotalTeamCount.value = totalTeamCount.value; // Set original count

    // Reset and collect all requests
    allRequests.value = [];
    allApprovedRequests.value = []; // Reset approved requests

    // 1. Add manager's own requests
    if (subordinateHierarchy.value.wfhRequests) {
      subordinateHierarchy.value.wfhRequests.forEach((request) => {
        allRequests.value.push({
          ...request,
          Staff: {
            Staff_ID: subordinateHierarchy.value.Staff_ID,
            Staff_FName: subordinateHierarchy.value.Staff_FName,
            Staff_LName: subordinateHierarchy.value.Staff_LName,
            Position: subordinateHierarchy.value.position,
            Reporting_Manager: subordinateHierarchy.value.Reporting_Manager,
          },
        });

        // Populate allApprovedRequests for counting
        if (
          request.Status === 'Approved' ||
          request.Status === 'Withdrawal Pending'
        ) {
          allApprovedRequests.value.push({
            ...request,
            Staff: {
              Staff_ID: subordinateHierarchy.value.Staff_ID,
              Staff_FName: subordinateHierarchy.value.Staff_FName,
              Staff_LName: subordinateHierarchy.value.Staff_LName,
              Position: subordinateHierarchy.value.position,
              Reporting_Manager: subordinateHierarchy.value.Reporting_Manager,
            },
          });
        }
      });
    }

    // 2. Collect all subordinate requests
    const collectSubordinateRequests = (subordinate) => {
      if (subordinate.wfhRequests) {
        subordinate.wfhRequests.forEach((request) => {
          allRequests.value.push({
            ...request,
            Staff: {
              Staff_ID: subordinate.Staff_ID,
              Staff_FName: subordinate.Staff_FName,
              Staff_LName: subordinate.Staff_LName,
              Position: subordinate.position,
              Reporting_Manager: subordinate.Reporting_Manager,
            },
          });

          // Populate allApprovedRequests for counting
          if (
            request.Status === 'Approved' ||
            request.Status === 'Withdrawal Pending'
          ) {
            allApprovedRequests.value.push({
              ...request,
              Staff: {
                Staff_ID: subordinate.Staff_ID,
                Staff_FName: subordinate.Staff_FName,
                Staff_LName: subordinate.Staff_LName,
                Position: subordinate.position,
                Reporting_Manager: subordinate.Reporting_Manager,
              },
            });
          }
        });
      }

      if (subordinate.subordinates) {
        subordinate.subordinates.forEach((sub) =>
          collectSubordinateRequests(sub),
        );
      }
    };

    if (subordinateHierarchy.value.subordinates) {
      subordinateHierarchy.value.subordinates.forEach((sub) =>
        collectSubordinateRequests(sub),
      );
    }

    // After collecting all approved requests, counts are handled in filteredDates
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
};

const countAllSubordinates = (manager) => {
  if (!manager || !manager.subordinates) return 0;
  return manager.subordinates.reduce((count, sub) => {
    return count + 1 + countAllSubordinates(sub);
  }, 0);
};

const managerOptions = computed(() => {
  if (!managerSubordinates.value) return [];

  const extractManagers = (subordinates, depth = 0) => {
    let managers = [];
    for (let sub of subordinates) {
      if (sub.subordinates && sub.subordinates.length > 0) {
        managers.push({
          value: sub.Staff_ID,
          text: `${sub.Staff_FName} ${sub.Staff_LName}`,
          depth: depth,
        });
        managers = managers.concat(
          extractManagers(sub.subordinates, depth + 1),
        );
      }
    }
    return managers;
  };

  if (
    !managerSubordinates.value.subordinates ||
    managerSubordinates.value.subordinates.length === 0
  ) {
    return [];
  }

  return [
    {
      value: managerSubordinates.value.Staff_ID,
      text: `${managerSubordinates.value.Staff_FName} ${managerSubordinates.value.Staff_LName}`,
      depth: 0,
    },
    ...extractManagers(managerSubordinates.value.subordinates, 1),
  ];
});

// Watch for manager changes and fetch new data
watch(selectedManager, async (newManagerId) => {
  if (newManagerId) {
    await updateAllSubordinateWFH(newManagerId);
  } else {
    // If no manager is selected, reload with the root manager's data
    await updateAllSubordinateWFH();
  }
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
              <div class="text-muted">
                Total Team Size: {{ totalTeamCount }}
              </div>
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

        <BOverlay :show="isLoading" rounded="sm" class="loader-container">
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

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}
</style>
