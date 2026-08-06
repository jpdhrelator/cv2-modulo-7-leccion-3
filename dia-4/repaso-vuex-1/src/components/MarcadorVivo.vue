<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const candidatos = computed(() => store.state.candidatos);
const total       = computed(() => store.getters.totalVotos);
const porcentajes = computed(() => store.getters.porcentajes);
const lider       = computed(() => store.getters.lider);
const hayEmpate   = computed(() => store.getters.hayEmpate);

const votosDe = computed(() => store.getters.votosDe);
</script>

<template>
  <section>
    <h3>Marcador — {{ total }} votos</h3>
    <p v-for="c in porcentajes" :key="c.id">
      {{ c.nombre }}: <b>{{ c.votos }}</b>  <small>{{ c.pct }}%</small>
    </p>
<hr>
    <p v-if="hayEmpate"><b>Empate técnico.</b></p>
    <p v-else-if="lider">Va ganando: <b>{{ lider.nombre }}</b></p>
    <p v-else>Todavía no hay votos.</p>

    <p>La Lista B lleva {{ votosDe(2) }} votos.</p>
    <p>La Lista C lleva {{ votosDe(3) }} votos.</p>
  </section>
</template>