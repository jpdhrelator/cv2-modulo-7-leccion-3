import axios from 'axios'
import { privado } from '../../api/privado'


const api = privado

export default {
    namespaced: true,

    state: () => ({
        /*
         * El token se lee de localStorage al arrancar para que la sesión
         * sobreviva a un F5. El state de Vuex vive en memoria: si sólo
         * estuviera ahí, recargar la página cerraría la sesión.
         */
        token: localStorage.getItem('token') || null,
        usuario: JSON.parse(localStorage.getItem('usuario') || 'null'),
        entrando: false,
        error: ''
    }),

    mutations: {
        ENTRANDO(state, v) { state.entrando = v },
        ERROR(state, msg) { state.error = msg },

        SESION(state, { token, usuario }) {
            state.token = token
            state.usuario = usuario
            state.error = ''
            // El efecto sobre localStorage acompaña al cambio de state para
            // que no puedan quedar desincronizados.
            localStorage.setItem('token', token)
            localStorage.setItem('usuario', JSON.stringify(usuario))
        },

        CERRAR(state) {
            state.token = null
            state.usuario = null
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
        }
    },

    actions: {
        async entrar({ commit }, { username, password }) {
            commit('ENTRANDO', true)
            commit('ERROR', '')

            try {
                const { data } = await api.post('/login', { username, password })
                commit('SESION', { token: data.token, usuario: data.usuario })
                return { ok: true }
            } catch (e) {
                // 401 acá significa credenciales incorrectas.
                commit('ERROR', e.response?.data?.message ?? 'No se pudo iniciar sesión.')
                return { ok: false }
            } finally {
                commit('ENTRANDO', false)
            }
        },

        salir({ commit }) {
            commit('CERRAR')
        },

        /*
         * Comprobar si el token sigue vivo.
         *
         * No basta con que exista en localStorage: puede haber expirado
         * mientras la pestaña estaba cerrada. La única forma de saberlo
         * es preguntarle al servidor.
         */
        async verificar({ state, commit }) {
            if (!state.token) return false

            try {
                await api.get('/perfil', { headers: { Authorization: `Bearer ${state.token}` } })
                return true
            } catch {
                commit('CERRAR')
                return false
            }
        }
    },

    getters: {
        autenticado: (state) => Boolean(state.token),
        esAdmin: (state) => state.usuario?.role === 'admin',
        nombre: (state) => state.usuario?.nombre ?? 'invitado'
    }
}