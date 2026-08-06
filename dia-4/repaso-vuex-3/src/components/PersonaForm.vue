<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const form = computed(() => store.state.personal.form)
const errores = computed(() => store.state.personal.errores)
const conflicto = computed(() => store.state.personal.conflicto)
const guardando = computed(() => store.state.personal.guardando)
const deptos = computed(() => store.state.personal.departamentos)
const completo = computed(() => store.getters['personal/formCompleto'])
const pideZona = computed(() => store.getters['personal/pideZona'])

/*
 * Escribir en el formulario es hacer commit de una mutation.
 *
 * NO se puede usar v-model contra el store: con strict:true Vue
 * intentaría escribir en el state fuera de una mutation y reventaría.
 * Este ayudante es el reemplazo y hace exactamente lo mismo.
 */
const set = (campo) => (e) =>
    store.commit('personal/CAMPO', { campo, valor: e.target.value })

onMounted(() => store.dispatch('personal/cargarDepartamentos'))

async function enviar() {
    const r = await store.dispatch('personal/guardar')
    if (r.ok) alert(`Persona creada con id ${r.persona.id}`)
    // Si falló NO hacemos nada más: el store ya guardó los errores
    // y el template los pinta solo.
}
</script>

<template>
    <form @submit.prevent="enviar">
        <h2>Nueva persona</h2>

        <!-- EL 409: arriba, separado, con su propia caja -->
        <div v-if="conflicto" class="conflicto">
            <strong>Esos datos ya están registrados</strong>
            <p>{{ conflicto.mensaje }}</p>
            <p v-for="(msg, campo) in conflicto.errores" :key="campo">{{ msg }}</p>
        </div>

        <label>
            RUT
            <input :value="form.rut" :class="{ malo: errores.rut }" placeholder="12345678-5"
                @input="set('rut')($event)">
            <small v-if="errores.rut">{{ errores.rut }}</small>
        </label>

        <label>
            Correo
            <input type="email" :value="form.email" :class="{ malo: errores.email }"
                placeholder="nombre.apellido@empresa.cl" @input="set('email')($event)">
            <small v-if="errores.email">{{ errores.email }}</small>
        </label>

        <label>
            Departamento
            <!-- Las opciones vienen del servidor, no escritas a mano -->
            <select :value="form.departamento" :class="{ malo: errores.departamento }"
                @change="set('departamento')($event)">
                <option value="">Elige uno…</option>
                <option v-for="d in deptos" :key="d.valor" :value="d.valor">
                    {{ d.etiqueta }}
                </option>
            </select>
            <small v-if="errores.departamento">{{ errores.departamento }}</small>
        </label>

        <!--
      CAMPO CONDICIONAL.
      Sólo aparece si el departamento es ventas. La condición vive en
      un getter, no en el template: así se puede probar y reutilizar.
    -->
        <label v-if="pideZona">
            Zona asignada
            <input :value="form.zona" @input="set('zona')($event)">
        </label>

        <!-- …nombre, apellido, teléfono y cargo, con el mismo patrón… -->

        <button type="submit" :disabled="guardando ">
            {{ guardando ? 'Guardando…' : 'Crear persona' }}
        </button>
    </form>
</template>