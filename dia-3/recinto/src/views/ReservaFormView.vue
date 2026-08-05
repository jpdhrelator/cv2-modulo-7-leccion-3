<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

const props = defineProps({
    id: { type: String, default: null }
});

const store = useStore();
const router = useRouter();

const form = computed(() => store.state.reservas.form)
const errores = computed(() => store.state.reservas.errores)
const conflicto = computed(() => store.state.reservas.conflicto)
const guardando = computed(() => store.state.reservas.guardando)
const bloques = computed(() => store.state.reservas.bloques)

const canchas = computed(() => store.getters['canchas/disponibles'])
const editando = computed(() => store.getters['reservas/editando'])
const completo = computed(() => store.getters['reservas/formCompleto'])

const set = (campo) => (evento) => store.commit('reservas/campo', { campo, valor: evento.target.value })

onMounted(async () => {
    if (props.id) {
        const r = await store.dispatch('reservas/prepararEdicion', props.id);
        console.log(r);
        
        // Si el id no existe, no dejamos al usuario mirando un formulario vacío.
        //if (!r.ok) router.replace({ name: 'reservas' })
    } else {
        await store.dispatch('reservas/prepararNueva')
    }
})


/*
 * Guardia de navegación: avisa si se va con cambios sin guardar.
 * Es específico del router y es la clase de detalle que separa
 * un formulario hecho de uno a medio hacer.
 */
// onBeforeRouteLeave(() => {
//     const sucio = form.value.cliente !== '' || form.value.canchaId !== ''
//     if (!sucio || guardando.value) return true
//     return confirm('Tienes cambios sin guardar. ¿Salir igual?')
// })



async function enviar() {
    const r = await store.dispatch('reservas/guardar')

    if (r.ok) {
        // Navegación PROGRAMÁTICA: se navega como consecuencia de algo
        // que pasó, no de un clic en un enlace.
        router.push({ name: 'reservas' })
        return
    }

    // Si falló, NO navegamos: el usuario tiene que ver qué pasó.
    // El store ya guardó los errores; el template los pinta solo.
}

function cancelar() {
    store.commit('reservas/resetForm')
    router.back();
}
</script>

<template>
    <section class="caja">
        <h2>{{ editando ? 'Editar reserva' : 'Nueva reserva' }}</h2>
        <div v-if="conflicto" class="choque">
            <strong>Ese horario ya está tomado</strong>
            <p>{{ conflicto.mensaje }}</p>
            <p v-if="conflicto.detalle" class="detalle">
                Lo tiene <strong>{{ conflicto.detalle.cliente }}</strong>
                ({{ conflicto.detalle.codigo }}, {{ conflicto.detalle.estado }}).
            </p>
        </div>
        <form @submit.prevent="enviar">
            <div class="fila">
                <label>
                    <span>Cancha</span>
                    <select :value="form.canchaId" :class="{ malo: errores.canchaId }"
                        @change="set('canchaId')($event)">
                        <option value="">Elige una cancha…</option>
                        <option v-for="c in canchas" :key="c.id" :value="c.id">
                            {{ c.nombre }} — {{ c.jugadores }} por lado
                        </option>
                    </select>
                    <!-- El mensaje viene del servidor, tal cual, sin retocar -->
                    <small v-if="errores.canchaId" class="malo-txt">{{ errores.canchaId }}</small>
                </label>

                <label>
                    <span>Jugadores</span>
                    <input type="number" min="2" max="22" :value="form.jugadores" :class="{ malo: errores.jugadores }"
                        @input="set('jugadores')($event)">
                    <small v-if="errores.jugadores" class="malo-txt">{{ errores.jugadores }}</small>
                </label>
            </div>

            <label>
                <span>Cliente</span>
                <input type="text" placeholder="Nombre del equipo o persona" :value="form.cliente"
                    :class="{ malo: errores.cliente }" @input="set('cliente')($event)">
                <small v-if="errores.cliente" class="malo-txt">{{ errores.cliente }}</small>
            </label>

            <label>
                <span>Teléfono</span>
                <input type="tel" placeholder="+56912345678" :value="form.telefono" :class="{ malo: errores.telefono }"
                    @input="set('telefono')($event)">
                <small v-if="errores.telefono" class="malo-txt">{{ errores.telefono }}</small>
            </label>

            <div class="fila">
                <label>
                    <span>Fecha</span>
                    <input type="date" :value="form.fecha" :class="{ malo: errores.fecha }"
                        @change="set('fecha')($event)">
                    <small v-if="errores.fecha" class="malo-txt">{{ errores.fecha }}</small>
                </label>

                <label>
                    <span>Bloque</span>
                    <!-- Las opciones vienen del servidor, no escritas a mano -->
                    <select :value="form.bloque" :class="{ malo: errores.bloque }" @change="set('bloque')($event)">
                        <option value="">Elige una hora…</option>
                        <option v-for="b in bloques" :key="b" :value="b">{{ b }} hrs</option>
                    </select>
                    <small v-if="errores.bloque" class="malo-txt">{{ errores.bloque }}</small>
                </label>
            </div>

            <label>
                <span>Comentario <em>(opcional)</em></span>
                <textarea rows="2" maxlength="200" :value="form.comentario"
                    @input="set('comentario')($event)"></textarea>
            </label>

            <footer class="pie">
                <button type="button" class="btn btn--gris" @click="cancelar">Cancelar</button>
                <button type="submit" class="btn" :disabled="guardando || !completo">
                    {{ guardando ? 'Guardando…' : (editando ? 'Guardar cambios' : 'Tomar reserva') }}
                </button>
            </footer>
        </form>
    </section>
</template>

<style scoped>
.caja {
  background: #fff;
  border: 1px solid #dfe6ec;
  border-radius: 12px;
  padding: 1.75rem;
  max-width: 640px;
  margin: 0 auto;
}

h2 { margin: 0 0 1.25rem; font-size: 1.3rem; }

form { display: flex; flex-direction: column; gap: 1rem; }

.fila { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

label { display: flex; flex-direction: column; gap: 0.35rem; }

label > span {
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
}

label > span em { font-weight: 400; color: #94a3b8; font-style: normal; }

input, select, textarea {
  padding: 0.55rem 0.7rem;
  border: 1px solid #cfd9e2;
  border-radius: 8px;
  font-size: 0.92rem;
  font-family: inherit;
  background: #fff;
}

input:focus, select:focus, textarea:focus {
  outline: 2px solid #42b883;
  outline-offset: 1px;
  border-color: #42b883;
}

/* El campo que el servidor marcó como inválido */
.malo { border-color: #c0392b; background: #fdf5f4; }

.malo-txt { color: #c0392b; font-size: 0.79rem; font-weight: 600; }

/* El 409: su propia caja, arriba, imposible de confundir con un campo */
.choque {
  background: #fdf3e4;
  border: 1px solid #e8c98a;
  border-left: 4px solid #c47a1b;
  border-radius: 0 8px 8px 0;
  padding: 0.9rem 1.1rem;
  margin-bottom: 1.25rem;
}

.choque strong { color: #96590c; display: block; margin-bottom: 0.25rem; }
.choque p { margin: 0.2rem 0 0; font-size: 0.88rem; color: #7a4e0d; }
.choque .detalle { font-size: 0.82rem; opacity: 0.85; }

.pie {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eef2f6;
}

.btn {
  background: #2f8f66;
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn--gris { background: #94a3b8; }

.btn:disabled { background: #b9ccc3; cursor: not-allowed; }

@media (max-width: 560px) {
  .fila { grid-template-columns: 1fr; }
  .caja { padding: 1.25rem; }
}
</style>