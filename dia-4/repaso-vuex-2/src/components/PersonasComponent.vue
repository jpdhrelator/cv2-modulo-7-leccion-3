<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const personas = computed(() => store.state.personas)
const cargando = computed(() => store.state.cargando)
const error = computed(() => store.state.error)
const activas = computed(() => store.getters.activas)

// El componente PIDE que se cargue. No sabe cómo, ni desde dónde,
// ni qué forma tiene la respuesta. Sólo dispara la action.
onMounted(() => store.dispatch('cargarPersonas'));

const recargar = () => store.dispatch('cargarPersonas')

const filtrarPorDepto = (departamento) => store.dispatch('cargarPersonas', departamento ? { departamento } : {})
</script>


<template>
  <section>
    <header>
      <h2>Personal</h2>
      <p>{{ activas.length }} activas de {{ personas.length }} en pantalla</p>
      <button :disabled="cargando" @click="recargar">
        {{ cargando ? 'Cargando…' : 'Recargar' }}
      </button>
    </header>

    <select @change="filtrarPorDepto($event.target.value)">
      <option value="">Todos los departamentos</option>
      <option value="informatica">Informática</option>
      <option value="ventas">Ventas</option>
      <option value="operaciones">Operaciones</option>
    </select>

    <!-- LOS CUATRO ESTADOS. No dos. -->
    <p v-if="cargando">Consultando el registro…</p>

    <p v-else-if="error">
      {{ error }}
      <button @click="recargar">Reintentar</button>
    </p>

    <p v-else-if="!personas.length">No hay personas que calcen con ese filtro.</p>

    <ul v-else>
      <li v-for="p in personas" :key="p.id">
        <b>{{ p.nombre }} {{ p.apellido }}</b> — {{ p.cargo }}
        <span v-if="!p.activo">(inactiva)</span>
      </li>
    </ul>
  </section>
</template>