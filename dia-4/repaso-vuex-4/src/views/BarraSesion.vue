<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const usuario = computed(() => store.state.auth.usuario)
const esAdmin = computed(() => store.getters['auth/esAdmin'])

/*
 * Cuenta regresiva del token.
 *
 * Ojo: esto es estado LOCAL y a propósito. Nadie más necesita saber
 * cuántos segundos quedan; es un adorno de esta barra. Si lo pusieras
 * en Vuex tendrías una mutation por segundo llenando Devtools de ruido.
 */
const restan = ref(null)
let reloj = null

async function medir () {
  try {
    const { data } = await privado.get('/perfil')
    restan.value = data.segundosRestantes
  } catch {
    restan.value = null
  }
}

onMounted(() => {
  medir()
  // Descontamos en el cliente y sólo re-preguntamos al servidor de vez
  // en cuando. Pedir /perfil cada segundo sería absurdo.
  reloj = setInterval(() => {
    if (restan.value === null) return
    restan.value = Math.max(0, restan.value - 1)
    if (restan.value % 60 === 0) medir()
  }, 1000)
})

// Sin esto el intervalo sigue corriendo después de desmontar el
// componente. Es la fuga de memoria más común en Vue.
onUnmounted(() => clearInterval(reloj))

const mmss = computed(() => {
  if (restan.value === null) return ''
  const m = String(Math.floor(restan.value / 60)).padStart(2, '0')
  const s = String(restan.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

const porPoco = computed(() => restan.value !== null && restan.value < 300)

async function salir () {
  await store.dispatch('auth/salir')
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="sesion">
    <strong>Mesa de Ayuda</strong>

    <nav>
      <router-link :to="{ name: 'panel' }">Panel</router-link>
      <router-link :to="{ name: 'tickets' }">Tickets</router-link>

      <!--
        Esconder el enlace es cortesía, NO seguridad.
        El guard del router sigue siendo obligatorio: cualquiera
        puede escribir /admin en la barra de direcciones.
      -->
      <router-link v-if="esAdmin" :to="{ name: 'admin' }">Administración</router-link>
    </nav>

    <span v-if="mmss" class="reloj" :class="{ 'reloj--poco': porPoco }">
      sesión {{ mmss }}
    </span>

    <span class="quien">
      {{ usuario?.nombre }}
      <span class="rol" :class="{ 'rol--admin': esAdmin }">{{ usuario?.role }}</span>
    </span>

    <button class="btn btn--gris btn--fino" @click="salir">Salir</button>
  </header>
</template>

<style scoped>
.sesion {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0 1.25rem;
  height: 56px;
  background: #1f2d3a;
  color: #fff;
}

nav { display: flex; gap: .4rem; flex: 1; }

nav a {
  color: #b9c7d4;
  text-decoration: none;
  padding: .45rem .8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: .88rem;
}

nav a:hover { background: rgba(255, 255, 255, .08); color: #fff; }

/*
 * Esta clase la pone Vue Router SOLO en el enlace de la ruta activa.
 * No inventes un ref para llevar la cuenta: ya está resuelto.
 *
 * Ojo con :deep() — no hace falta acá porque el <a> lo genera
 * router-link dentro de ESTE componente, así que scoped lo alcanza.
 */
nav a.router-link-active { background: #2f8f66; color: #fff; }

/* Quién soy. El rol se muestra a propósito: evita que alguien
   se pregunte por qué no ve el botón de eliminar. */
.quien { font-size: .85rem; color: #c9d5e0; white-space: nowrap; }

.rol {
  font-size: .7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .05em;
  padding: .15rem .5rem;
  border-radius: 999px;
  margin-left: .4rem;
  background: #4a5b6d;
  color: #fff;
}

.rol--admin { background: #f0b429; color: #3a2c00; }

/* La cuenta regresiva del token. Cuando bajan de 5 minutos se pone
   roja: el usuario alcanza a guardar lo que esté haciendo. */
.reloj {
  font-size: .78rem;
  color: #93a4b5;
  font-variant-numeric: tabular-nums;
}

.reloj--poco { color: #ffb4a8; font-weight: 700; }

@media (max-width: 700px) {
  .sesion { height: auto; flex-wrap: wrap; padding: .6rem 1rem; }
  nav { order: 3; width: 100%; }
}
</style>