
<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const tickets =computed(()=> store.state.tickets);

const pendientes = computed(() => store.getters.ticketPendientesCantidad);

</script>

<template>
<aside>
    <p>Total: {{ tickets.length }}</p>
    <p>Pendientes: {{ pendientes }}</p>
  </aside>
</template>