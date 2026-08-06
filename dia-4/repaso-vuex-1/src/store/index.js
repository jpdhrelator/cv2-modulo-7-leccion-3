import { createStore } from 'vuex';

export const store = createStore({
    state: () => ({
        candidatos: [
            { id: 1, nombre: 'Lista A · Renovación', votos: 0 },
            { id: 2, nombre: 'Lista B · Continuidad', votos: 0 },
            { id: 3, nombre: 'Lista C · Independiente', votos: 0 }
        ],
        mesaAbierta: true
    }),
    mutations: {

        REGISTRAR_VOTO(state, id) {
            const c = state.candidatos.find(c => c.id === id)
            if (c) c.votos++
        },
        CERRAR_MESA(state) {
            state.mesaAbierta = false;
        },
    },
    getters: {
        totalVotos(state) {
            return state.candidatos.reduce((suma, c) => suma + c.votos, 0)
        },
        porcentajes(state, getters) {
            const total = getters.totalVotos;
            if (total === 0) return state.candidatos.map(c => ({ ...c, pct: 0 }));
            return state.candidatos.map(c => ({
                ...c,
                pct: Number(((c.votos / total) * 100).toFixed(1))
            }))
        },
        ranking(state) {
            return [...state.candidatos].sort((a, b) => b.votos - a.votos)
        },
        lider(state, getters) {
            return getters.totalVotos > 0 ? getters.ranking[0] : null
        },
        hayEmpate(state, getters) {
            const r = getters.ranking
            return r.length > 1 && r[0].votos === r[1].votos && r[0].votos > 0
        },
        votosDe(state) {
            return (id) => state.candidatos.find(c => c.id === id)?.votos ?? 0
        }

    }
});
