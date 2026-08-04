
<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const filtro = computed({
  get: () => store.state.filtroEstado,
  set: (valor) => store.commit('setFiltroEstado', valor)
})
const tickets =computed(()=> store.getters.ticketsVisibles);
function cerrar(id) {
    store.commit('cambiarEstado',{id, estado: 'cerrado'});
}
onMounted(()=> store.dispatch('cargarTickets'));
</script>

<template>
    <label>
      Filtrar por estado
      <select v-model="filtro">
        <option value="todos">Todos</option>
        <option value="abierto">Abiertos</option>
        <option value="en_proceso">En proceso</option>
        <option value="cerrado">Cerrados</option>
      </select>
    </label>
 <ul>
    <li v-for="t in tickets" :key="t.id">
      <strong>{{ t.codigo }}</strong> {{ t.asunto }}
      <em>({{ t.prioridad }} · {{ t.estado }})</em>

      <button
        v-if="t.estado !== 'cerrado'"
        @click="cerrar(t.id)">
        Cerrar
      </button>
    </li>
  </ul>
</template>