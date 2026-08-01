<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store=useStore();
const productos= computed(()=>store.getters.productosDisponibles);
const carrito = computed(()=>store.state.carrito);
const totalCarrito=computed(()=>store.getters.totalCarritoFormateado)


function agregaCarrito(producto) {
    store.dispatch('agregarAlCarrito',producto);
}
function eliminarDelCarrito(producto) {    
    store.dispatch('eliminarDelCarrito',producto);
}
</script>

<template>
    <div>
        <h2>Producto Diponibles</h2>
        <ul>
            <li v-for="p in productos" :key="p.id">
                {{ p.nombre }} — stock: {{ p.stock }} 
                <button type="button" @click="agregaCarrito(p)">Agregar a Carrito</button>
            </li>
        </ul>

    </div>
    <div>
        <h3>Carrito ({{ totalCarrito }})</h3>
        <ul>
            <li v-for="p in carrito" :key="p.id">
                {{ p.nombre }} — cantidad: {{ p.cantidad }} 
                <button type="button" @click="eliminarDelCarrito(p)">Sacar del Carrito</button>
            </li>
        </ul>
    </div>
</template>
