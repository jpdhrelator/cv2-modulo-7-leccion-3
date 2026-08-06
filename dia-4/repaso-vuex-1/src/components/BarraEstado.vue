<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const total = computed(() =>  store.getters.totalVotos);
const ranking = computed(() =>  store.getters.ranking);

console.log(ranking.value);





</script>
<template>
  <footer class="barra">
    Votos emitidos: <b>{{ total }}</b>

    <h4>Ranking</h4>
  </footer>
</template>