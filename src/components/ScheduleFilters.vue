<template>
  <BRow class="my-2">
    <BCol class="col-4 col-md-2">
      <BFormSelect
        :modelValue="isMonthView"
        :options="dayWeekFilterDropdownSelectOptions"
        @update:modelValue="$emit('update:isMonthView', $event)"
      />
    </BCol>
    <BCol>
      <BDropdown text="Filter by Status" variant="light" auto-close="outside">
        <BDropdownForm>
          <BFormCheckbox
            v-for="option in statusOptions"
            :key="option.value"
            v-model="localSelectedStatuses"
            :value="option.value"
          >
            {{ option.text }}
          </BFormCheckbox>
        </BDropdownForm>
      </BDropdown>
    </BCol>
    <BCol>
      <BDropdown text="Filter by WFH Time" variant="light" auto-close="outside">
        <BDropdownForm>
          <BFormCheckbox
            v-model="selectAllWfhTimes"
            @change="toggleAllWfhTimes"
          >
            Select All
          </BFormCheckbox>
          <BFormCheckbox
            v-for="option in wfhTimeOptions"
            :key="option.value"
            v-model="localSelectedWfhTimes"
            :value="option.value"
          >
            {{ option.text }}
          </BFormCheckbox>
        </BDropdownForm>
      </BDropdown>
    </BCol>
    <BCol>
      <BFormSelect
        :modelValue="selectedManager"
        :options="indentedManagerOptions"
        @update:modelValue="$emit('update:selectedManager', $event)"
      >
        <template #first>
          <option value="">All Managers</option>
        </template>
      </BFormSelect>
    </BCol>
  </BRow>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  isMonthView: Boolean,
  statusOptions: Array,
  wfhTimeOptions: Array,
  managerOptions: Array,
  selectedStatuses: Array,
  selectedWfhTimes: Array,
  selectedManager: String,
});

const emit = defineEmits([
  'update:isMonthView',
  'update:selectedStatuses',
  'update:selectedWfhTimes',
  'update:selectedManager',
]);

const dayWeekFilterDropdownSelectOptions = [
  { value: true, text: 'Month' },
  { value: false, text: 'Week' },
];

const localSelectedStatuses = computed({
  get: () => props.selectedStatuses,
  set: (value) => emit('update:selectedStatuses', value),
});

const localSelectedWfhTimes = computed({
  get: () => props.selectedWfhTimes,
  set: (value) => emit('update:selectedWfhTimes', value),
});

const selectAllWfhTimes = ref(true);

const toggleAllWfhTimes = () => {
  if (selectAllWfhTimes.value) {
    localSelectedWfhTimes.value = props.wfhTimeOptions.map(
      (option) => option.value,
    );
  } else {
    localSelectedWfhTimes.value = [];
  }
};

const indentedManagerOptions = computed(() => {
  return props.managerOptions.map((option) => ({
    ...option,
    text: '\u00A0'.repeat(option.depth * 4) + option.text,
  }));
});

watch(localSelectedWfhTimes, (newValue) => {
  selectAllWfhTimes.value = newValue.length === props.wfhTimeOptions.length;
});

// Initialize selected options
if (localSelectedStatuses.value.length === 0) {
  localSelectedStatuses.value = props.statusOptions.map(
    (status) => status.value,
  );
}
if (localSelectedWfhTimes.value.length === 0) {
  localSelectedWfhTimes.value = props.wfhTimeOptions.map(
    (option) => option.value,
  );
}
</script>
