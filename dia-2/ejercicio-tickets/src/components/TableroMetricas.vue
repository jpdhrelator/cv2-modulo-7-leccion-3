<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const total = computed(() => store.state.tickets.length)
const conteo = computed(() => store.getters.conteoPorEstado)
const urgentes = computed(() => store.getters.ticketsUrgente)
const alerta = computed(() => store.getters.hayUrgentes)

const bajas = computed(() => store.getters.porPrioridad('baja'))
</script>
<template>
    <section class="tablero">
        <article>
            <h3>Total</h3>
            <p>{{ total }}</p>
        </article>
        <article>
            <h3>Abiertos</h3>
            <p>{{ conteo.abierto }}</p>
        </article>
        <article>
            <h3>En proceso</h3>
            <p>{{ conteo.en_proceso }}</p>
        </article>
        <article>
            <h3>Cerrados</h3>
            <p>{{ conteo.cerrado }}</p>
        </article>

        <!-- Empty state: nunca dejes una zona en blanco sin explicación -->
        <p v-if="!alerta" class="ok">
            Sin urgencias pendientes. Buen momento para tomar café.
        </p>
        <p v-else class="alerta">
            Hay {{ urgentes.length }} ticket(s) de prioridad alta esperando.
        </p>

        <small>Prioridad baja: {{ bajas.length }}</small>
    </section>
</template>