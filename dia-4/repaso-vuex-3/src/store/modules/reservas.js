import { http } from '../../http/http';

export default {
    namespaced: true,

    state: () => ({
        lista: [],
        meta: { pagina: 1, porPagina: 6, total: 0, totalPaginas: 1 },
        cargando: false,
        error: ''
    }),
    mutations: {
        PIDIENDO(state) { state.cargando = true; state.error = '' },
        RECIBIDAS(state, { datos, meta }) {
            state.lista = datos
            state.meta = meta
            state.cargando = false
        },
        FALLO(state, msg) { state.error = msg; state.cargando = false }
    },
    actions: {
        async cargar({ commit, state }) {
            commit('PIDIENDO');
            try {
                const { data } = await http.get('/reservas', {
                    params: { pagina: state.meta.pagina, porPagina: state.meta.porPagina }
                });
                commit('RECIBIDAS', data)
            } catch (error) {
                commit('FALLO', e.mensaje)
            }
        },
        async iniciar({ dispatch }) {
            await Promise.all([
                dispatch('canchas/cargar', {forzar:true}, { root: true }),
                dispatch('cargar')
            ])
        },
        
    },
    getters: {
            conValor(state, getters, rootState, rootGetters) {
                const indice = rootGetters['canchas/porId']

                return state.lista.map(r => ({
                    ...r,
                    valorHora: indice[r.canchaId]?.valorHora ?? 0
                }))
            },

            confirmadas: (state) => state.lista.filter(r => r.estado === 'confirmada')
        }
}