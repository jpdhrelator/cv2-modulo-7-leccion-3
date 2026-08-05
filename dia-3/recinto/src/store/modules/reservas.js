import { http } from "../../api/api"
const formVacio = () => ({
    id: null,
    canchaId: '',
    cliente: '',
    telefono: '+569',
    fecha: '',
    bloque: '',
    jugadores: 10,
    comentario: ''
})

export default {
    namespaced: true,

    state: () => ({
        form: formVacio(),
        errores: {},
        conflicto: null,
        guardando: false,
        bloques: [],
        estados: [],



        /**.    */
        lista: [],
        meta: {
            pagina: 1,
            porPagina: 6,
            total: 0,
            totalPaginas: 1,
            hayAnterior: false,
            haySiguiente: false
        },
        filtros: {
            estado: '',
            canchaId: '',
            fecha: '',
            buscar: ''
        },
        cargando: false,
        error: null,
        ocupadaId: null
    }),
    mutations: {
        campo(state, { campo, valor }) {
            state.form[campo] = valor

            // Si el usuario corrige el campo, el error de ESE campo se va.
            // Los demás se quedan: no le borres todos los mensajes de golpe,
            // porque pierde la referencia de qué le faltaba.
            if (state.errores[campo]) {
                delete state.errores[campo]
            }

            // Cualquier cambio invalida el conflicto anterior: quizá justo
            // acaba de cambiar la hora y ya no choca con nada.
            state.conflicto = null
        },

        cargarForm(state, reserva) {
            state.form = {
                id: reserva.id,
                canchaId: reserva.canchaId,
                cliente: reserva.cliente,
                telefono: reserva.telefono,
                fecha: reserva.fecha,
                bloque: reserva.bloque,
                jugadores: reserva.jugadores,
                comentario: reserva.comentario ?? ''
            }
            state.errores = {}
            state.conflicto = null
        },

        resetForm(state) {
            state.form = formVacio()
            state.errores = {}
            state.conflicto = null
        },

        errores(state, errores) {
            state.errores = errores ?? {}
        },

        conflicto(state, conflicto) {
            state.conflicto = conflicto
        },

        guardando(state, valor) {
            state.guardando = valor
        },

        opciones(state, { bloques, estados }) {
            state.bloques = bloques
            state.estados = estados
        },



        pidiendo(state) {
            state.cargando = true,
                state.error = null
        },
        recibidas(state, { lista, meta }) {
            state.lista = lista,
                state.meta = meta,
                state.cargando = false
        },
        fallo(state, mensaje) {
            state.error = mensaje,
                state.cargando = false
        },
        filtro(state, { campo, valor }) {
            state.filtros[campo] = valor
            // Cambiar un filtro siempre devuelve a la página 1. Si no lo haces,
            // filtras y quedas en la página 4 de un resultado que tiene 2.
            state.meta.pagina = 1
        },
        limpiarFiltros(state) {
            state.filtros = { estado: '', canchaId: '', fecha: '', buscar: '' }
            state.meta.pagina = 1
        },
        pagina(state, pagina) {
            state.meta.pagina = pagina
        },
        acupada(state, id) {
            state.ocupadaId = id
        },
        reemplazar(state, reserva) {
            const i = state.lista.findIndex(r => r.id === reserva.id)
            if (i !== -1) state.lista.splice(i, 1, reserva)
        },
        quitar(state, id) {
            state.lista = state.lista.filter(r => r.id !== id)
            state.meta.total = Math.max(0, state.meta.total - 1)
        }
    },

    actions: {

        async cargarOpciones({ commit, state }) {
            if (state.bloques.length) return          // otra vez: no pidas lo que ya tienes

            try {
                const { data } = await http.get('/reservas/bloques')
                commit('opciones', data)
            } catch (e) {
                commit('fallo', e.mensaje)
            }
        },
        /*
     * Preparar el formulario para EDITAR.
     *
     * Va a la red aunque la reserva ya esté en `lista`, y a propósito:
     * la lista puede tener treinta segundos de antigüedad y estás por
     * sobrescribir el registro. Antes de editar algo, léelo fresco.
     */
        async prepararEdicion({ commit, dispatch }, id) {
            commit('resetForm')
            commit('pidiendo')

            await dispatch('cargarOpciones')
            await dispatch('canchas/cargar', null, { root: true })

            try {
                const { data } = await http.get(`/reservas/${id}`);
                console.log('data',data);
                
                commit('cargarForm', data)
                commit('recibidas', { datos: [], meta: { ...state.meta } })   // apaga `cargando`
                return { ok: true }
            } catch (e) {
                commit('fallo', e.mensaje)
                return { ok: false, mensaje: e.mensaje }
            }
        },

        async prepararNueva({ commit, dispatch }) {
            commit('resetForm')
            await dispatch('cargarOpciones')
            await dispatch('canchas/cargar', null, { root: true })
        },

        /*
     * GUARDAR: acá está toda la lección.
     *
     * Devuelve un resultado en vez de lanzar una excepción. El componente
     * necesita saber si navegar o quedarse, y para eso un objeto
     * { ok, id } es infinitamente más cómodo que un try/catch.
     */
        async guardar({ commit, state, dispatch }) {
            commit('guardando', true)
            commit('errores', {})
            commit('conflicto', null)

            // El servidor espera números; los <select> y <input> siempre
            // devuelven texto. Si mandas canchaId: "3" el backend lo convierte,
            // pero no confíes en eso: conviértelo tú.
            const cuerpo = {
                canchaId: Number(state.form.canchaId),
                cliente: state.form.cliente.trim(),
                telefono: state.form.telefono.trim(),
                fecha: state.form.fecha,
                bloque: state.form.bloque,
                jugadores: Number(state.form.jugadores),
                comentario: state.form.comentario.trim() || null
            }

            const editando = state.form.id !== null

            try {
                const { data } = editando
                    ? await http.put(`/reservas/${state.form.id}`, cuerpo)
                    : await http.post('/reservas', cuerpo)

                commit('resetForm')

                // La agenda tiene que reflejar el cambio.
                await dispatch('cargar')

                return { ok: true, id: data.id, codigo: data.codigo, editando }

            } catch (e) {
                // 422 → el servidor mandó un mapa campo → mensaje.
                // Se guarda tal cual y el template lo pinta bajo cada input.
                // No lo traduzcas, no lo reescribas: el backend ya redactó
                // un mensaje bueno y en español.
                if (e.estado === 422) {
                    commit('errores', e.errores)
                    return { ok: false, tipo: 'validacion' }
                }

                // 409 → la cancha ya está tomada. No hay campo culpable:
                // TODOS los campos están bien escritos. El problema es el mundo.
                if (e.estado === 409) {
                    commit('conflicto', { mensaje: e.mensaje, detalle: e.conflicto })
                    return { ok: false, tipo: 'conflicto' }
                }

                // Cualquier otra cosa: caída, timeout, 404 al editar.
                commit('fallo', e.mensaje)
                return { ok: false, tipo: 'error', mensaje: e.mensaje }

            } finally {
                commit('guardando', false)
            }
        },

        async cargar({ commit, state }) {

            commit('pidiendo');
            // Los filtros vacíos NO se mandan. Si envías estado=''
            // el servidor lo recibe como texto vacío y te devuelve 400.
            const params = { pagina: state.meta.pagina, porPagina: state.meta.porPagina }
            Object.entries(state.filtros).forEach(([campo, valor]) => {
                if (valor !== '' && valor !== null) params[campo] = valor
            });
            try {
                const { data } = await http.get('/reservas', { params });
                commit('recibidas', { lista: data.datos, meta: data.meta });
            } catch (e) {
                commit('fallo', e.mensaje)
            }
        },
        async filtrar({ commit, dispatch }, { campo, valor }) {
            commit('filtro', { campo, valor })
            await dispatch('cargar')
        },
        async limpiar({ commit, dispatch }) {
            commit('limpiarFiltros')
            await dispatch('cargar')
        },
        async irAPagina({ commit, dispatch }, pagina) {
            commit('pagina', pagina)
            await dispatch('cargar')
        },
        async cambiarEstado({ commit }, { id, estado }) {
            commit('ocupada', id)

            try {
                const { data } = await http.patch(`/reservas/${id}`, { estado })
                commit('reemplazar', data)
                return { ok: true }
            } catch (e) {
                return { ok: false, mensaje: e.mensaje }
            } finally {
                // finally corre pase lo que pase. Sin esto, un error dejaría
                // la fila deshabilitada para siempre.
                commit('ocupada', null)
            }
        },

        async eliminar({ commit, dispatch, state }, id) {
            commit('ocupada', id)

            try {
                await http.delete(`/reservas/${id}`)
                commit('quitar', id)

                // Si borraste el último de la página, esa página ya no existe.
                // Retrocede una y recarga.
                if (state.lista.length === 0 && state.meta.pagina > 1) {
                    await dispatch('irAPagina', state.meta.pagina - 1)
                }

                return { ok: true }
            } catch (e) {
                return { ok: false, mensaje: e.mensaje }
            } finally {
                commit('ocupada', null)
            }
        },
        async iniciar({ dispatch }) {
            await Promise.all([
                dispatch('canchas/cargar', null, { root: true }),
                dispatch('cargar')
            ])
        }

    },

    getters: {
        hayFiltros(state) {
            return Object.values(state.filtros).some(v => v !== '')
        },

        vacia(state) {
            return !state.cargando && !state.error && state.lista.length === 0
        },

        /*
         * Conteo por estado de LO QUE HAY EN PANTALLA.
         *
         * Ojo con esto, que es la confusión del ejercicio 5: este getter
         * cuenta la página actual, no el recinto completo. Son seis reservas
         * de catorce. Si quieres el total real, eso lo da /reservas/resumen.
         */
        conteoVisible(state) {
            return state.lista.reduce((acc, r) => {
                acc[r.estado] = (acc[r.estado] ?? 0) + 1
                return acc
            }, { pendiente: 0, confirmada: 0, cancelada: 0 })
        },
        /*
            * Tercer y cuarto parámetro de un getter: rootState y rootGetters.
            * Son la ventana al resto del store.
            *
            *   getter(state, getters, rootState, rootGetters)
            *
            * `rootGetters` usa la clave COMPLETA con el prefijo del módulo,
            * incluso desde dentro de otro módulo.
        */
        conValor(state, getters, rootState, rootGetters) {
            const indice = rootGetters['canchas/porId']

            return state.lista.map(reserva => ({
                ...reserva,
                valorHora: indice[reserva.canchaId]?.valorHora ?? 0,
                techada: indice[reserva.canchaId]?.techada ?? false
            }))
        },

        editando(state) {
            return state.form.id !== null
        },

        /*
         * Validación de CORTESÍA, para deshabilitar el botón mientras
         * falta algo obvio. No reemplaza al servidor: lo acompaña.
         *
         * Nunca vas a poder saber desde acá si la cancha está tomada.
         */
        formCompleto(state) {
            const f = state.form
            return Boolean(f.canchaId && f.cliente.trim().length >= 3 && f.fecha && f.bloque)
        }
    }

}