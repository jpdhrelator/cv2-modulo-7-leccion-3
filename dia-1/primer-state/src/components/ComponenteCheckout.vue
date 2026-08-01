<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const total = computed(() =>store.getters.totalCarritoFormateado);
const totalProducto = computed(() =>store.getters.totalProductos);
const totalProductoTotal = computed(() =>store.getters.totalProductosDisponibles);
</script>
<template>
    <div>

        <h6>Productos Totales {{ totalProducto }}</h6>
        <h6>Productos Disponibles Total {{ totalProductoTotal }}</h6>

        <h6>Checkout</h6>
        <h3>Total:{{ total }}</h3>
    </div>
</template>


