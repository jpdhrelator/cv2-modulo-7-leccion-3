import { createStore } from 'vuex';
import { http } from '../http/http';



export const store = createStore({
    state: () => ({
        personas: [],
        paginacion: null,
        cargando: false,
        error: ''
    }),
    mutations: {
        PIDIENDO(state) {
            state.cargando = true
            state.error = ''
        },
        PERSONAS_RECIBIDAS(state, { resultados, paginacion }) {
            state.personas = resultados
            state.paginacion = paginacion
            state.cargando = false
        },
        PERSONAS_FALLARON(state, mensaje) {
            state.error = mensaje
            state.cargando = false
        }
    },
    actions: {
        async cargarPersonas({ commit }, filtros = {}) {
            commit('PIDIENDO');
            try {
                const { data } = await http.get('/personas', { params: filtros })
                commit('PERSONAS_RECIBIDAS', data)
            } catch (e) {
                // `e` ya viene con forma conocida gracias al interceptor.
                commit('PERSONAS_FALLARON', e.mensaje)
            }
        }
    },
    getters: {
        hayPersonas: (state) => state.personas.length > 0,
        activas: (state) => state.personas.filter(p => p.activo),
        personaPorId(state) {
            return state.personas.reduce((idx, p) => { idx[p.id] = p; return idx }, {})
        }
    }
});