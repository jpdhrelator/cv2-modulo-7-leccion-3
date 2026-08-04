import { createStore } from 'vuex';
import api from '../api/api';

export default createStore({
    state: () => ({
        tickets: [],
        paginacion: { pagina: 1, porPagina: 10, total: 0, totalPaginas: 1 },
        filtroEstado: 'todos', // 'todos' | 'abierto' | 'en_proceso' | 'cerrado'
        cargando: false,      // ← ¿estamos esperando a la API?
        error: ''             // ← mensaje humano, no el error técnico

    }),
    getters: {
        ticketPendientes: (state) => state.tickets.filter(t => t.estado !== 'cerrado'),
        ticketsAbiertos: (state) => state.tickets.filter(t => t.estado === 'abierto'),
        ticketsCerrados: (state) => state.tickets.filter(t => t.estado === 'cerrado'),
        ticketPendientesCantidad: (state, getters) => getters.ticketPendientes.length,
        ticketsAbiertosCantidad: (state, getters) => getters.ticketsAbiertos.length,
        ticketsCerradosCantidad: (state, getters) => getters.ticketsCerrados.length,

        ticketsUrgente: (state, getters) => getters.ticketPendientes.filter(t => t.prioridad === 'alta'),
        hayUrgentes: (state, getters) => getters.ticketsUrgente.length > 0,
        conteoPorEstado: (state, getters) => ({
            abierto: getters.ticketsAbiertosCantidad,
            en_proceso: getters.ticketPendientesCantidad,
            cerrado: getters.ticketsCerradosCantidad
        }),
        ticketsVisibles: (state) => {
            if (state.filtroEstado === 'todos') return state.tickets
            return state.tickets.filter(t => t.estado === state.filtroEstado)
        },
        porPrioridad: (state) => (prioridad) => {
            return state.tickets.filter(t => t.prioridad === prioridad)
        },
        porId: (state) => (id) => {
            return state.tickets.find(t => t.id === id)
        }
    },
    mutations: {
        agregarTicket(state, ticket) {
            state.tickets.push(ticket)
        },
        cambiarEstado(state, { id, estado }) {
            const t = state.tickets.find(x => x.id === id);
            if (!t) return;

            t.estado = estado;
        },
        cambiarPrioridad(state, { id, prioridad }) {
            const t = state.tickets.find(x => x.id === id);
            if (!t) return;

            t.prioridad = prioridad;
        },
        setFiltroEstado(state, estado) {
            state.filtroEstado = estado;
        },
        setTickets(state, lista) { state.tickets = lista },
        setPaginacion(state, p) { state.paginacion = p },
        setError(state, mensaje) { state.error = mensaje || '' },
        setCargando(state, valor) { state.cargando = valor },
    },
    actions: {
        async cargarTickets({ commit, state }) {
            commit('setCargando', true);
            commit('setError', '');
            try {
                const { data } = await api.get('/tickets', {
                    params: {
                        estado: state.filtroEstado === 'todos' ? undefined : state.filtroEstado,
                        porPagina: 50,
                        orden: 'recientes'
                    }
                });
                commit('setTickets', data.datos);
                commit('setPaginacion', {
                    pagina: data.meta.pagina,
                    porPagina: data.meta.porPagina,
                    total: data.meta.total,
                    totalPaginas: data.meta.totalPaginas
                })
            } catch (error) {
                commit('setError', 'No pudimos cargar la bandeja. ¿Está corriendo el servidor en el puerto 3001?')
                console.error(e)
            } finally {
                commit('setCargando', false);
            }
        }
    }
});