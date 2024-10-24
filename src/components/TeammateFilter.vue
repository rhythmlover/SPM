<!-- TeammateFilter.vue -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  teammates: {
    type: Array,
    required: true,
  },
  selectedTeammates: {
    type: Array,
    required: true,
  },
  statusOptions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits([
  'update:selectedTeammates',
  'update:selectedStatuses',
]);

const localSelectedTeammates = ref(new Set(props.selectedTeammates));
const localSelectedStatuses = ref(
  new Set(props.statusOptions.map((status) => status.value)),
);

const selectAllTeammates = computed({
  get: () => localSelectedTeammates.value.size === props.teammates.length,
  set: (value) => {
    if (value) {
      localSelectedTeammates.value = new Set(
        props.teammates.map((teammate) => teammate.Staff_ID),
      );
    } else {
      localSelectedTeammates.value.clear();
    }
    emitUpdate();
  },
});

const selectAllStatuses = computed({
  get: () => localSelectedStatuses.value.size === props.statusOptions.length,
  set: (value) => {
    if (value) {
      localSelectedStatuses.value = new Set(
        props.statusOptions.map((status) => status.value),
      );
    } else {
      localSelectedStatuses.value.clear();
    }
    emitUpdateStatuses();
  },
});

const isTeammateSelected = (staffId) =>
  localSelectedTeammates.value.has(staffId);

const isStatusSelected = (statusValue) =>
  localSelectedStatuses.value.has(statusValue);

const toggleTeammate = (staffId) => {
  if (localSelectedTeammates.value.has(staffId)) {
    localSelectedTeammates.value.delete(staffId);
  } else {
    localSelectedTeammates.value.add(staffId);
  }
  emitUpdate();
};

const toggleStatus = (statusValue) => {
  if (localSelectedStatuses.value.has(statusValue)) {
    localSelectedStatuses.value.delete(statusValue);
  } else {
    localSelectedStatuses.value.add(statusValue);
  }
  emitUpdateStatuses();
};

const emitUpdate = () => {
  emit('update:selectedTeammates', Array.from(localSelectedTeammates.value));
};

const emitUpdateStatuses = () => {
  emit('update:selectedStatuses', Array.from(localSelectedStatuses.value));
};

watch(
  () => props.selectedTeammates,
  (newValue) => {
    localSelectedTeammates.value = new Set(newValue);
  },
  { deep: true },
);

onMounted(() => {
  if (localSelectedTeammates.value.size === 0 && props.teammates.length > 0) {
    localSelectedTeammates.value = new Set(
      props.teammates.map((teammate) => teammate.Staff_ID),
    );
    emitUpdate();
  }
  emitUpdateStatuses();
});
</script>

<template>
  <div class="d-flex">
    <BDropdown text="Filter by Teammate" class="me-2" auto-close="outside">
      <BDropdownForm>
        <BFormCheckbox v-model="selectAllTeammates" @click.stop>
          Select All
        </BFormCheckbox>
        <BFormCheckbox
          v-for="teammate in teammates"
          :key="teammate.Staff_ID"
          :modelValue="isTeammateSelected(teammate.Staff_ID)"
          @update:modelValue="() => toggleTeammate(teammate.Staff_ID)"
        >
          {{ teammate.Staff_FName }} {{ teammate.Staff_LName }}
        </BFormCheckbox>
      </BDropdownForm>
    </BDropdown>
    <BDropdown text="Filter by Status" auto-close="outside">
      <BDropdownForm>
        <BFormCheckbox v-model="selectAllStatuses"> Select All </BFormCheckbox>
        <BFormCheckbox
          v-for="status in statusOptions"
          :key="status.value"
          :modelValue="isStatusSelected(status.value)"
          @update:modelValue="() => toggleStatus(status.value)"
        >
          {{ status.text }}
        </BFormCheckbox>
      </BDropdownForm>
    </BDropdown>
  </div>
</template>
