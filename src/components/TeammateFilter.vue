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
});

const emit = defineEmits(['update:selectedTeammates']);

const localSelectedTeammates = ref(new Set(props.selectedTeammates));

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

const isTeammateSelected = (staffId) =>
  localSelectedTeammates.value.has(staffId);

const toggleTeammate = (staffId) => {
  if (localSelectedTeammates.value.has(staffId)) {
    localSelectedTeammates.value.delete(staffId);
  } else {
    localSelectedTeammates.value.add(staffId);
  }
  emitUpdate();
};

const emitUpdate = () => {
  emit('update:selectedTeammates', Array.from(localSelectedTeammates.value));
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
});
</script>

<template>
  <BDropdown text="Filter by Teammate" class="float-end">
    <BDropdownForm>
      <BFormCheckbox v-model="selectAllTeammates"> Select All </BFormCheckbox>
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
</template>
