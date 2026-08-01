<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex';

const store = useStore();
const numero = computed(()=> store.state.numero );
function restaNumero() {
     store.commit('setNumero',numero.value-1 );
}
function toogelEstadoProductos() {
    store.commit('toogleEstadoProd');
}
</script>
<template>
    <div>
        <h1>Comp B</h1>
        <h2>{{ numero }}</h2>
        <button @click="restaNumero">B dice: {{ numero }}</button>
        <button @click="toogelEstadoProductos"> Toogle Activar Estado Productos</button>
    </div>
</template>
