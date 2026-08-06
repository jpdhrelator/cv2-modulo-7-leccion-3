<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

const store = useStore()
const router = useRouter()
const route = useRoute()

/*
 * Éste SÍ es estado local, y a propósito.
 *
 * Usuario y contraseña sólo existen mientras se llena este formulario;
 * nadie más los necesita y la contraseña NO debe quedar en el store ni
 * un segundo de más. Compara con el ejercicio 6, donde el formulario sí
 * iba al store: la diferencia es quién necesita el dato.
 */
const username = ref('')
const password = ref('')

const entrando = computed(() => store.state.auth.entrando)
const error    = computed(() => store.state.auth.error)

// Avisos que llegan por query desde el guard o el interceptor.
const expirada = computed(() => route.query.expirada === '1')

async function entrar () {
  const r = await store.dispatch('auth/entrar', {
    username: username.value,
    password: password.value
  })

  if (r.ok) {
    // Vuelve a donde quería ir antes de que lo mandáramos al login.
    router.push(route.query.volverA || { name: 'panel' })
  }
}
</script>

<template>
  <!-- .login centra el formulario en la pantalla completa -->
  <div class="login">
    <form @submit.prevent="entrar">
      <h2>Iniciar sesión</h2>

      <!--
        Dos avisos distintos y con color distinto:
        el naranjo informa (la sesión venció, no hiciste nada mal),
        el rojo es un error (la contraseña no es ésa).
      -->
      <p v-if="expirada" class="alerta alerta--aviso">
        Tu sesión expiró. Vuelve a entrar.
      </p>
      <p v-if="error" class="alerta">{{ error }}</p>

      <label>
        <span>Usuario</span>
        <input v-model="username" autocomplete="username" placeholder="admin">
      </label>

      <label>
        <span>Contraseña</span>
        <input v-model="password" type="password" autocomplete="current-password">
      </label>

      <button class="btn" :disabled="entrando">
        {{ entrando ? 'Entrando…' : 'Entrar' }}
      </button>

      <p class="pista">admin / admin123 &middot; operador / operador123</p>
    </form>
  </div>
</template>

<style scoped>
/*
 * Estos estilos son SÓLO de esta pantalla: nada de esto se repite en
 * ninguna otra parte de la aplicación, así que vive acá y no en la
 * hoja global. Los .btn y los inputs sí vienen de estilos.css, porque
 * ésos se usan en todas partes.
 */

/* El login ocupa la pantalla completa y centra su tarjeta.
   Es la única vista sin la barra de navegación arriba. */
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: #f0f3f7;
}

.login form {
  background: #fff;
  border: 1px solid #dde4ec;
  border-radius: 14px;
  padding: 2rem;
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: .8rem;
  box-shadow: 0 8px 30px rgba(28, 37, 48, .08);
}

h2 { margin: 0 0 .5rem; font-size: 1.3rem; text-align: center; }

label { display: flex; flex-direction: column; gap: .3rem; }
label > span { font-size: .82rem; font-weight: 700; color: #475569; }

input { width: 100%; }

/*
 * DOS avisos con DOS colores, y la diferencia importa:
 *
 *   .alerta          → rojo. Es un error tuyo: esa contraseña no es.
 *   .alerta--aviso   → naranjo. No hiciste nada mal, sólo venció el token.
 *
 * Pintarlos iguales le diría al usuario que se equivocó cuando no fue así.
 */
.alerta {
  margin: 0;
  padding: .6rem .8rem;
  border-radius: 8px;
  font-size: .85rem;
  background: #fdeceb;
  border: 1px solid #f0b7b1;
  color: #96251a;
}

.alerta--aviso {
  background: #fdf3e4;
  border-color: #e8c98a;
  color: #7a4e0d;
}

.pista {
  margin: .5rem 0 0;
  text-align: center;
  font-size: .78rem;
  color: #94a3b8;
}
</style>