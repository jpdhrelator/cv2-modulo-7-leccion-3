import { createRouter, createWebHistory } from 'vue-router'
import { store } from '../store'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  {
    path: '/',
    name: 'panel',
    component: () => import('../views/PanelView.vue'),
    meta: { requiereAuth: true }
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: () => import('../views/TicketsView.vue'),
    meta: { requiereAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    // Dos condiciones: sesión Y rol.
    meta: { requiereAuth: true, rol: 'admin' }
  }
]

export const router = createRouter({ history: createWebHistory(), routes })

/*
 * Guard global: corre antes de entrar a cualquier ruta.
 */
router.beforeEach(async (to) => {
  const necesita = to.matched.some(r => r.meta.requiereAuth)
  if (!necesita) return true

  // ¿Hay token? Si no, al login guardando a dónde quería ir.
  if (!store.getters['auth/autenticado']) {
    return { name: 'login', query: { volverA: to.fullPath } }
  }

  // Hay token, pero puede haber expirado mientras la pestaña
  // estaba cerrada. Se lo preguntamos al servidor.
  const vivo = await store.dispatch('auth/verificar')
  if (!vivo) return { name: 'login', query: { expirada: '1' } }

  // Sesión válida. ¿Alcanza el rol?
  const rolPedido = to.meta.rol
  if (rolPedido && store.state.auth.usuario?.role !== rolPedido) {
    // NO lo mandamos al login: su sesión está perfecta.
    return { name: 'panel', query: { sinPermiso: '1' } }
  }

  return true
})