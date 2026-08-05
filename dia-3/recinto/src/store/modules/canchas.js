import { http } from "../../api/api";

export default {
    namespaced: true,

    state: () => ({
        lista: [],
        cargando: false,
        error: null
    }),
    mutations: {
        pidiendo(state) {
            state.cargando = true,
                state.error = null
        },
        recibidas(state, lista) {
            state.lista = lista,
                state.cargando = false
        },
        fallo(state, mensaje) {
            state.error = mensaje,
                state.cargando = false
        }
    },
    actions: {
        async cargar({ commit, state }) {

            commit('pidiendo');
            try {
                const { data } = await http.get('/canchas');
                console.log(data);
                
                commit('recibidas', data);
                return data;
            } catch (error) {
                commit('fallo', error.mensaje);
                return [];
            }
        }
    },
    getters: {
        disponibles(state) {
            return state.lista.filter((c) => c.activa);
        },
        porId(state) {
            return state.lista.reduce((indice, cancha) => {
                indice[cancha.id] = cancha
                return indice
            }, {})
        },
        nombreDe(state, getters) {
            return (id) => getters.porId[id]?.nombre ?? 'Cancha desconocida'
        },

        hayCanchas(state) {
            return state.lista.length > 0
        }
    },

}