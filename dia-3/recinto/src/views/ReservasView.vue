<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
const store = useStore();

const reservas = computed(() => store.state.reservas.lista);
const meta = computed(() => store.state.reservas.meta);
const filtros = computed(() => store.state.reservas.filtros);
const cargando = computed(() => store.state.reservas.cargando);
const error = computed(() => store.state.reservas.error);
const ocupadaId = computed(() => store.state.reservas.ocupadaId);

const vacia = computed(() => store.getters['reservas/vacia']);
const hayFiltros = computed(() => store.getters['reservas/hayFiltros']);
const conteo = computed(() => store.getters['reservas/conteoVisible']);


const canchas = computed(() => store.getters['canchas/disponibles']);


onMounted(() => store.dispatch('reservas/iniciar'));


const filtrar = (campo, valor) => store.dispatch('reservas/filtrar', { campo, valor });
const limpiar = () => store.dispatch('reservas/limpiar');
async function cambiar(reserva, estado) {
    const r = await store.dispatch('reservas/cambiarEstado', { id: reserva.id, estado })
    if (!r.ok) alert(r.mensaje)
}
async function eliminar(reserva) {
    if (!confirm(`¿Eliminar la reserva ${reserva.codigo} de ${reserva.cliente}?`)) return

    const r = await store.dispatch('reservas/eliminar', reserva.id)
    if (!r.ok) alert(r.mensaje)
}

const fecha = (iso) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
</script>

<template>
    <section>
        <header class="cabecera">
            <div>
                <h2>Agenda</h2>
                <p class="sub">
                    {{ meta.total }} reservas · mostrando {{ reservas.length }}
                    <span class="pip pip--pen">{{ conteo.pendiente }} pend.</span>
                    <span class="pip pip--con">{{ conteo.confirmada }} conf.</span>
                    <span class="pip pip--can">{{ conteo.cancelada }} canc.</span>
                </p>
            </div>
            <router-link class="btn" :to="{ name: 'reserva-nueva' }">+ Nueva</router-link>
        </header>
        <div class="filtros">
            <input type="search" placeholder="Buscar cliente o código…" :value="filtros.buscar"
                @input="filtrar('buscar', $event.target.value)">
            <select :value="filtros.estado" @change="filtrar('estado', $event.target.value)">
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="confirmada">Confirmadas</option>
                <option value="cancelada">Canceladas</option>
            </select>
            <select :value="filtros.canchaId" @change="filtrar('canchaId', $event.target.value)">
                <option value="">Todas las canchas</option>
                <option v-for="c in canchas" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
            <input type="date" :value="filtros.fecha" @change="filtrar('fecha', $event.target.value)">

            <button v-if="hayFiltros" class="btn btn--gris" @click="limpiar">Limpiar</button>
        </div>
        <div v-if="cargando" class="aviso">Cargando la agenda…</div>
        <div v-else-if="error" class="aviso aviso--error">{{ error }}</div>
        <div v-else-if="vacia" class="aviso">
            <p>{{ hayFiltros ? 'Ninguna reserva calza con esos filtros.' : 'Todavía no hay reservas.' }}</p>
            <button v-if="hayFiltros" class="btn btn--gris" @click="limpiar">Quitar filtros</button>
            <router-link v-else class="btn" :to="{ name: 'reserva-nueva' }">Tomar la primera</router-link>
        </div>
        <div v-else class="tabla-caja">
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Cancha</th>
                        <th>Cuándo</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in reservas" :key="r.id" :class="{ ocupada: ocupadaId === r.id }">
                        <td class="mono">{{ r.codigo }}</td>
                        <td>
                            <strong>{{ r.cliente }}</strong>
                            <small>{{ r.jugadores }} jugadores</small>
                        </td>
                        <!-- canchaNombre viene resuelto del backend: no cruzamos nada -->
                        <td>{{ r.canchaNombre }}</td>
                        <td>
                            {{ fecha(r.fecha) }}
                            <small>{{ r.bloque }} hrs</small>
                        </td>
                        <td><span class="chip" :class="'chip--' + r.estado">{{ r.estado }}</span></td>
                        <td class="acciones">
                            <button v-if="r.estado !== 'confirmada'" :disabled="ocupadaId === r.id"
                                @click="cambiar(r, 'confirmada')">Confirmar</button>

                            <button v-if="r.estado !== 'cancelada'" :disabled="ocupadaId === r.id"
                                @click="cambiar(r, 'cancelada')">Cancelar</button>

                            <router-link v-if="r.estado !== 'cancelada'"
                                :to="{ name: 'reserva-editar', params: { id: r.id } }">Editar</router-link>

                            <button class="borrar" :disabled="ocupadaId === r.id" @click="eliminar(r)">
                                Eliminar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <nav v-if="meta.totalPaginas > 1" class="paginas">
            <button :disabled="!meta.hayAnterior" @click="store.dispatch('reservas/irAPagina', meta.pagina - 1)">←
                Anterior</button>

            <span>Página {{ meta.pagina }} de {{ meta.totalPaginas }}</span>

            <button :disabled="!meta.haySiguiente"
                @click="store.dispatch('reservas/irAPagina', meta.pagina + 1)">Siguiente →</button>
        </nav>
    </section>
</template>


<style scoped>
.cabecera {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

h2 {
    margin: 0 0 0.25rem;
    font-size: 1.4rem;
}

.sub {
    margin: 0;
    color: #64748b;
    font-size: 0.88rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
}

.pip {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
}

.pip--pen {
    background: #fdf3e4;
    color: #96590c;
}

.pip--con {
    background: #e9f6f0;
    color: #2f8f66;
}

.pip--can {
    background: #f1f5f9;
    color: #64748b;
}

.btn {
    background: #2f8f66;
    color: #fff;
    border: 0;
    border-radius: 8px;
    padding: 0.55rem 1rem;
    font-weight: 600;
    font-size: 0.86rem;
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
}

.btn--gris {
    background: #64748b;
}

.filtros {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-bottom: 1.1rem;
    padding: 0.85rem;
    background: #fff;
    border: 1px solid #dfe6ec;
    border-radius: 10px;
}

.filtros input,
.filtros select {
    padding: 0.45rem 0.65rem;
    border: 1px solid #cfd9e2;
    border-radius: 7px;
    font-size: 0.86rem;
    font-family: inherit;
}

.filtros input[type="search"] {
    flex: 1;
    min-width: 190px;
}

.aviso {
    background: #fff;
    border: 1px solid #dfe6ec;
    border-radius: 10px;
    padding: 2.25rem 1.5rem;
    text-align: center;
    color: #64748b;
}

.aviso--error {
    background: #fdeceb;
    border-color: #f0b7b1;
    color: #96251a;
}

.tabla-caja {
    background: #fff;
    border: 1px solid #dfe6ec;
    border-radius: 10px;
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.87rem;
    min-width: 720px;
}

th,
td {
    padding: 0.65rem 0.85rem;
    text-align: left;
    border-bottom: 1px solid #eef2f6;
}

th {
    background: #f7f9fb;
    font-size: 0.73rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
}

tbody tr:last-child td {
    border-bottom: 0;
}

/* La fila que está esperando al servidor se apaga. Sólo esa. */
tr.ocupada {
    opacity: 0.5;
    pointer-events: none;
}

td small {
    display: block;
    color: #94a3b8;
    font-size: 0.76rem;
}

.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8rem;
    color: #64748b;
}

.chip {
    font-size: 0.73rem;
    font-weight: 700;
    padding: 0.18rem 0.55rem;
    border-radius: 999px;
    text-transform: capitalize;
}

.chip--pendiente {
    background: #fdf3e4;
    color: #96590c;
}

.chip--confirmada {
    background: #e9f6f0;
    color: #2f8f66;
}

.chip--cancelada {
    background: #f1f5f9;
    color: #64748b;
}

.acciones {
    white-space: nowrap;
    display: flex;
    gap: 0.3rem;
}

.acciones button,
.acciones a {
    background: none;
    border: 1px solid #cfd9e2;
    border-radius: 6px;
    padding: 0.25rem 0.55rem;
    font-size: 0.76rem;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    text-decoration: none;
}

.acciones button:hover,
.acciones a:hover {
    border-color: #2f8f66;
    color: #2f8f66;
}

.acciones .borrar:hover {
    border-color: #c0392b;
    color: #c0392b;
}

.acciones button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.paginas {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.1rem;
    font-size: 0.86rem;
    color: #64748b;
}

.paginas button {
    background: #fff;
    border: 1px solid #cfd9e2;
    border-radius: 7px;
    padding: 0.4rem 0.8rem;
    font-weight: 600;
    cursor: pointer;
}

.paginas button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>