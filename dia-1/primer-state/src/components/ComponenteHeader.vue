<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const total = computed(() =>store.getters.totalCarrito);
</script>
<template>
    <div>
        <h6>Header</h6>
        <span> total:{{ total }}</span>
    </div>
</template>


