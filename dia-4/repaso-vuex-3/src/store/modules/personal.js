import { http } from '../../http/http';


const formVacio = () => ({
    id: null,
    rut: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cargo: '',
    departamento: '',
    activo: true
});

export default {
    namespaced: true,

    state: () => ({
        lista: [],
        departamentos: [],
        form: formVacio(),
        errores: {},
        conflicto: null,
        guardando: false

    }),
    mutations: {
        CAMPO(state, { campo, valor }) {
            state.form[campo] = valor;
            if (state.errores[campo]) delete state.errores[campo]
            state.conflicto = null
        },
        RESET(state) {
            state.form = formVacio()
            state.errores = {}
            state.conflicto = null
        },
        ERRORES(state, errores) { state.errores = errores ?? {} },
        CONFLICTO(state, c) { state.conflicto = c },
        GUARDANDO(state, v) { state.guardando = v },
        LISTA(state, l) { state.lista = l },
        DEPARTAMENTOS(state, d) { state.departamentos = d }
    },
    actions: {
        async cargarDepartamentos({ commit, state }) {
            if (state.departamentos.length) return   // ya los tenemos

            const { data } = await http.get('/personas/departamentos')
            commit('DEPARTAMENTOS', data.departamentos)
        },
        async cargarLista({ commit }) {
            const { data } = await http.get('/personas')
            commit('LISTA', data.resultados)
        },
        async guardar({ commit, state, dispatch }) {
            commit('GUARDANDO', true)
            commit('ERRORES', {})
            commit('CONFLICTO', null)

            const cuerpo = {
                rut: state.form.rut.trim(),
                nombre: state.form.nombre.trim(),
                apellido: state.form.apellido.trim(),
                email: state.form.email.trim(),
                telefono: state.form.telefono.trim() || null,
                cargo: state.form.cargo.trim(),
                departamento: state.form.departamento,
                activo: state.form.activo
            }

            try {
                const { data } = await http.post('/personas', cuerpo)
                commit('RESET')
                await dispatch('cargarLista')
                return { ok: true, persona: data }

            } catch (e) {
                // 422 → el servidor mandó un mapa campo → mensaje.
                // Se guarda tal cual y el template lo pinta bajo cada input.
                // NO lo traduzcas: el backend ya redactó un mensaje bueno.
                if (e.estado === 422) {
                    commit('ERRORES', e.errores)
                    return { ok: false, tipo: 'validacion' }
                }

                // 409 → el dato está PERFECTAMENTE escrito, pero ya existe.
                // No hay nada que corregir en el campo: hay que usar otro RUT.
                if (e.estado === 409) {
                    commit('CONFLICTO', { mensaje: e.mensaje, errores: e.errores })
                    return { ok: false, tipo: 'conflicto' }
                }

                return { ok: false, tipo: 'error', mensaje: e.mensaje }

            } finally {
                commit('GUARDANDO', false)
            }
        }
    },
    getters: {
        formCompleto(state) {
            const f = state.form
            return Boolean(f.rut && f.nombre.trim() && f.apellido.trim() &&
                f.email.trim() && f.cargo.trim() && f.departamento)
        },

        // El campo condicional: la zona sólo se pide si es de ventas.
        pideZona: (state) => state.form.departamento === 'ventas'
    }
}