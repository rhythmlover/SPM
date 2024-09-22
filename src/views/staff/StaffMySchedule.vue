<script setup>
import { onMounted, computed, ref } from 'vue';

// Get the current date and viewing date
const currentDate = ref(new Date());
const viewingDate = ref(new Date());
const monthDiff = ref(0);
const currentMonth = computed(() => viewingDate.value.toLocaleString('default', { month: 'long' }));

// Handle changing month click
const disablePreviousMonthButton = computed(() => monthDiff.value - 1 < -2);
const disableNextMonthButton = computed(() => monthDiff.value + 1 > 3);
const handleChangeMonthClick = (movement) => {
  // Prevent viewing > 3 months and < 2 months
  if (monthDiff.value + movement > 3 || monthDiff.value + movement < -2) {
    return;
  }
  monthDiff.value += movement;

  // Calculate new date
  const newDate = new Date(viewingDate.value);
  newDate.setMonth(newDate.getMonth() + movement);
  // Assign new date
  viewingDate.value = newDate;
};

// Calculate the days in the current month with formatting
const formattedDaysInCurrentMonth = computed(() => {
  const year = viewingDate.value.getFullYear();
  const month = viewingDate.value.getMonth(); // 0-based month
  const days = new Date(year, month + 1, 0).getDate(); // Get last day of the month

  // // Create an array of all days in the month with formatting
  // return Array.from({ length: days }, (_, i) => {
  //   const date = new Date(year, month, i + 1);
  //   const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  //   const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

  //   return { date: date.toISOString().split('T')[0], formattedDate };
  // });

  // Month names for formatting
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Create an array of all days in the month with formatting
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    const formattedDate = `${monthNames[month]} ${i + 1}, ${year} (${dayName})`;

    return { date: date.toISOString().split('T')[0], formattedDate };
  });
});

// Use onMounted to initialize currentDate once
onMounted(() => {
  currentDate.value = new Date();
  viewingDate.value = new Date();
});
</script>

<template>
  <BContainer>
    <BRow>
      <BCol>
        <h1>Staff Schedule</h1>
      </BCol>
    </BRow>
    <BRow>
      <BCol cols="3">
        <BDropdown text="Dropdown">
          <BDropdownItem @click="console.log('FIRST')">First Action</BDropdownItem>
          <BDropdownItem @click="console.log('SECOND')">Second Action</BDropdownItem>
          <BDropdownItem @click="console.log('THIRD')">Third Action</BDropdownItem>
          <BDropdownItem disabled>Disabled action</BDropdownItem>
        </BDropdown>
      </BCol>
      <BCol cols="3"> </BCol>
    </BRow>
    <BRow>
      <BCol>
        <BButton @click="handleChangeMonthClick(-1)" :disabled="disablePreviousMonthButton" pill>
          {{ '<' }}
        </BButton>
      </BCol>
      <BCol class="text-center">
        <h3>{{ currentMonth }}</h3>
      </BCol>
      <BCol class="d-flex justify-content-end"
        ><BButton
          @click="handleChangeMonthClick(1)"
          :disabled="disableNextMonthButton"
          pill
          class="align-right"
          >{{ '>' }}</BButton
        ></BCol
      >
    </BRow>
    <BRow>
      <BCol>
        <div v-for="day in formattedDaysInCurrentMonth" :key="day.date">
          <BButton v-b-toggle="day.date" class="m-1">{{ day.formattedDate }}</BButton>
          <!-- Element to collapse -->
          <BCollapse :id="day.date">
            <BCard>I am collapsible content!</BCard>
          </BCollapse>
        </div>
      </BCol>
    </BRow>
  </BContainer>
</template>

<style></style>
