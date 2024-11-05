<script setup>
import { useRouter } from 'vue-router';
import ApplyRecurring from '../components/ApplyArrangementRecurring.vue';

const router = useRouter();

function redirectToApply() {
  router.push('/apply-arrangement');
}
</script>

<template>
  <main class="container mt-5">
    <div class="d-flex mt-3">
      <button @click="redirectToApply" class="btn btn-secondary">
        Apply Non-Recurring Arrangement
      </button>
    </div>
    <ApplyRecurring />
  </main>
</template>
