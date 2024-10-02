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
    }
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
    background-color: transparent;
    border: 1px solid #28a745;
    color: #28a745;
}

button.withdraw-btn:hover {
    background-color: #28a745;
    color: white;
}

button.reject-submit-btn {
    background-color: #28a745;
    color: white;
}

button.reject-cancel-btn {
    background-color: #6c757d;
    color: white;
}
</style>