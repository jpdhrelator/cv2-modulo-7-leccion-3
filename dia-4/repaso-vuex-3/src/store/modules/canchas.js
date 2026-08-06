import { http } from '../../http/http'
export default {
    namespaced: true,
    state: () => ({
        lista: [],
        cargando: false,
        error: ''
    }),
    mutations: {
        PIDIENDO(state) { state.cargando = true; state.error = '' },
        RECIBIDAS(state, lista) { state.lista = lista; state.cargando = false },
        FALLO(state, msg) { state.error = msg; state.cargando = false }
    },
    actions: {
        async cargar({ commit, state }, { forzar = false } = {}) {
            if (state.lista.length > 0 && !forzar) return state.lista;
            commit('PIDIENDO');

            try {
                const { data } = await http.get('/canchas');
                commit('RECIBIDAS', data);
                return data
            } catch (error) {
                commit('FALLO', e.mensaje)
                return []

            }

        }
    },
    getters: {
        disponibles: (state) => state.lista.filter(c => c.activa),

        porId(state) {
            return state.lista.reduce((idx, c) => { idx[c.id] = c; return idx }, {})
        },

        // Un getter puede devolver una función cuando quien consulta
        // necesita pasar un argumento.
        nombreDe(state, getters) {
            return (id) => getters.porId[id]?.nombre ?? 'Cancha desconocida'
        }
    }
}