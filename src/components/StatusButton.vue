<template>
  <BButton :class="['btn', btnClass]">
    {{ label }}
  </BButton>
</template>

<script>
export default {
  name: 'StatusButton',
  props: {
    label: String,
    btnClass: String,
  },
};
</script>

<style scoped>
button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 10px;
}

button.accept-btn {
  background-color: #28a745;
  color: white;
}

button.reject-btn {
  background-color: #dc3545;
  color: white;
}

button.withdraw-btn {
  background-color: #ffc107;
  color: white;
}

button.reject-submit-btn,
button.withdraw-submit-btn {
  background-color: #28a745;
  color: white;
}

button.reject-cancel-btn,
button.withdraw-cancel-btn {
  background-color: #6c757d;
  color: white;
}

button:hover {
  opacity: 0.8;
}
</style>
