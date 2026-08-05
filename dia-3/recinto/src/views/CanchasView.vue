<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore();

const canchas = computed(() => store.state.canchas.lista);
const cargando = computed(() => store.state.canchas.cargando);
const error = computed(() => store.state.canchas.error);
const activas = computed(() => store.getters['canchas/disponibles']);

const pesos = (valor) =>
    valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

const superficies = {
    pasto_sintetico: 'Pasto sintético',
    pasto_natural: 'Pasto natural',
    cemento: 'Cemento'
}

onMounted(() => store.dispatch('canchas/cargar'));

</script>

<template>
    <section>
        <header class="cabecera">
            <div>
                <h2>Canchas del recinto</h2>
                <p class="sub">
                    {{ activas.length }} disponibles de {{ canchas.length }} totales
                </p>
            </div>
        </header>
        <div v-if="cargando" class="aviso">Consultando el catálogo…</div>
        <div v-else-if="error" class="aviso aviso--error">
            {{ error }}
            <button class="btn btn--fino" @click="recargar">Reintentar</button>
        </div>
        <div v-else-if="!canchas.length" class="aviso">
            No hay canchas registradas.
        </div>
        <div v-else class="grilla">
            <article v-for="cancha in canchas" :key="cancha.id" class="tarjeta"
                :class="{ 'tarjeta--baja': !cancha.activa }">
                <h3> {{ cancha.nombre }}</h3>
                <dl>
                    <dt>Superficie</dt>
                    <dd>{{ superficies[cancha.superficie] }}</dd>

                    <dt>Formato</dt>
                    <dd>{{ cancha.jugadores }} por lado</dd>

                    <dt>Valor hora</dt>
                    <dd class="precio">{{ pesos(cancha.valorHora) }}</dd>
                </dl>
                <footer>
                    <span v-if="cancha.techada" class="etiqueta">Techada</span>
                    <span v-if="!cancha.activa" class="etiqueta etiqueta--baja">Fuera de servicio</span>
                </footer>

            </article>
        </div>
    </section>
</template>

<style scoped>
.cabecera {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

h2 {
    margin: 0 0 0.25rem;
    font-size: 1.4rem;
}

.sub {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
}

.btn {
    background: #2f8f66;
    color: #fff;
    border: 0;
    border-radius: 8px;
    padding: 0.55rem 1rem;
    font-weight: 600;
    font-size: 0.88rem;
    cursor: pointer;
}

.btn:disabled {
    background: #9bb8ab;
    cursor: not-allowed;
}

.btn--fino {
    padding: 0.3rem 0.7rem;
    margin-left: 0.75rem;
    font-size: 0.8rem;
}

.aviso {
    background: #fff;
    border: 1px solid #dfe6ec;
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    color: #64748b;
}

.aviso--error {
    background: #fdeceb;
    border-color: #f0b7b1;
    color: #96251a;
}

/*
  auto-fill + minmax: las tarjetas se acomodan solas según el ancho
  disponible. Sin media queries y sin contar columnas a mano.
*/
.grilla {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
}

.tarjeta {
    background: #fff;
    border: 1px solid #dfe6ec;
    border-radius: 12px;
    padding: 1.1rem;
    border-top: 3px solid #42b883;
}

.tarjeta--baja {
    border-top-color: #cbd5e1;
    opacity: 0.65;
}

.tarjeta h3 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
}

dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.3rem 0.75rem;
    margin: 0 0 0.75rem;
    font-size: 0.85rem;
}

dt {
    color: #7c8a99;
}

dd {
    margin: 0;
    text-align: right;
    font-weight: 600;
}

.precio {
    color: #2f8f66;
}

.etiqueta {
    display: inline-block;
    background: #e9f6f0;
    color: #2f8f66;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
}

.etiqueta--baja {
    background: #f1f5f9;
    color: #64748b;
}
</style>