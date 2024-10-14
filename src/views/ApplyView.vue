<script setup>
import { useRouter } from 'vue-router';
import Apply from '../components/ApplyArrangement.vue';

const router = useRouter();

function redirectToApplyRecurring() {
  router.push('/apply-arrangement-recurring');
}
</script>

<template>
  <main class="container mt-5">
    <div class="d-flex mt-3">
      <button @click="redirectToApplyRecurring" class="btn btn-secondary">
        Apply Recurring Arrangement
      </button>
    </div>
    <Apply />
  </main>
</template>
