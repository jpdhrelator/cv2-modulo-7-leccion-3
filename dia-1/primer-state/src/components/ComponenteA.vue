<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const numero = computed(()=> store.state.numero );

function sumarNumero() {
     store.commit('setNumero',numero.value+1);
}
</script>
<template>
    <div>
        <h1>Comp A</h1>
        <h2>{{ numero }}</h2>

        <button @click="sumarNumero">A dice: {{ numero }}</button>
    </div>
</template>
