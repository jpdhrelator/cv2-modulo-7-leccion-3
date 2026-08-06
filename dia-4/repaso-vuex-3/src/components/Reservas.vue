<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore();

const reservas = computed(() => store.state.reservas.lista)
const cargando = computed(() => store.state.reservas.cargando)
const canchas  = computed(() => store.getters['canchas/disponibles'])
const nombreDe = computed(() => store.getters['canchas/nombreDe'])

onMounted(() => store.dispatch('reservas/iniciar'));
</script>
<template>
  <section>
    <h2>Reservas</h2>

    <select>
      <option value="">Todas las canchas</option>
      <option v-for="c in canchas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
    </select>

    <p v-if="cargando">Cargando…</p>

    <ul v-else>
      <li v-for="r in reservas" :key="r.id">
        {{ r.codigo }} — {{ r.cliente }} — {{ nombreDe(r.canchaId) }}
      </li>
    </ul>
  </section>
</template>