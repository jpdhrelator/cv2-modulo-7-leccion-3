<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const candidatos  = computed(() => store.state.candidatos);
const mesaAbierta = computed(() => store.state.mesaAbierta);

function votar(id) {store.commit('REGISTRAR_VOTO', id);}
function cerrarVotacion() {store.commit('CERRAR_MESA');}
</script>
<template>
  <section>
    <h3>Papeleta</h3>
    <button
      v-for="c in candidatos"
      :key="c.id"
      :disabled="!mesaAbierta"
      @click="votar(c.id)"
    >
      {{ c.nombre }}
    </button>


    <hr>
    <button @click="cerrarVotacion" type="button">Cerra Votación</button>
  </section>
</template>