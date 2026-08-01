import { createStore } from 'vuex';


export default createStore({

    state: () => ({
        numero: 10,
        productos: [
            { id: 'p-01', nombre: 'Teclado mecánico', precio: 45900, stock: 20, categoria: 'perifericos', activo: true },
            { id: 'p-02', nombre: 'Mouse vertical', precio: 29900, stock: 0, categoria: 'perifericos', activo: true },
            { id: 'p-03', nombre: 'Monitor 27"', precio: 189000, stock: 4, categoria: 'pantallas', activo: true }
        ],
        carrito: [],
        errores: []
    }),


    getters: {
        totalProductos(state) {
            return state.productos.length;
        },
        productosDisponibles(state) {
            return state.productos.filter(p => p.stock > 0)
        },
        totalProductosDisponibles(state) {
            return state.productos.filter(p => p.stock > 0).length
        },

        totalCarrito(state) {
            return state.carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
        },
        totalCarritoFormateado(state, getters) {
            return new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP'
            }).format(getters.totalCarrito);
        }
    },

    mutations: {
        setNumero(state, n) {
            state.numero = n;
        },

        toogleEstadoProd(state) {
            state.productos.forEach(p => p.activo = !p.activo);
        },
        actualizarStock(state, { id, delta }) {
            const prod = state.productos.find((p) => p.id === id);
            if (!prod) return;
            prod.stock += delta;
        },
        setProducto(state, listaProd) {
            state.productos = [...listaProd];
        },
        setError(state, error) {
            state.errores.push(error);
        },
        clearError(state, error) {
            state.errores=[];
        },
        subirCantidad(state, idProducto) {
            const prod = state.carrito.find((p) => p.id === idProducto);
            prod.cantidad += 1;
        },
        agregarItem(state,producto){
            state.carrito.push(producto);
        },
        eliminarItem(state,producto){
            state.carrito = state.carrito.filter((p)=> p.id === producto.id);
        }

    },
    actions: {
        agregarAlCarrito({ state, commit, getters }, producto) {

            if (producto.stock <= 0) {
                commit('setError', `Sin stock de ${producto.nombre}`)
                return false
            }
            const existeElCarro = state.carrito.some(i => i.id === producto.id);

            if (existeElCarro) {
                commit('subirCantidad', producto.id)
            } else {
                commit('agregarItem', {
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    cantidad: 1
                })
            }

            commit('actualizarStock', { id: producto.id, delta: -1 });
            return true;
        },
        eliminarDelCarrito({ state, commit, getters }, producto){

            commit('eliminarItem', producto.id);
            commit('actualizarStock', { id: producto.id, delta: +1 });
            return true;
        }
    }

});