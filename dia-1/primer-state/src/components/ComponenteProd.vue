<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const productos = computed(() => store.state.productos);

function sumarStock(id) {
    store.commit('actualizarStock', {id, delta: +1});
}
function restarStock(id) {
    store.commit('actualizarStock', {id, delta: -1});
}
function toogelEstadoProductos() {
    store.commit('toogleEstadoProd');
}
function resetProductos() {
    store.commit('setProducto',[]);
}
function poblarProductos() {
    store.commit('setProducto',[
            { id: 'p-03', nombre: 'Escritorio', precio: 45900, stock: 20, activo:true },
            { id: 'p-04', nombre: 'Silla', precio: 29900, stock: 10, activo:true }]);
}
</script>
<template>
    <div>
        <button @click="toogelEstadoProductos"> Toogle Activar Estado Productos</button>
        <button @click="resetProductos()">Reset</button>
        <button @click="poblarProductos()">Poblar</button>
        <ul>
            <li v-for="p in productos" :key="p.id">
                {{ p.nombre }} — stock: {{ p.stock }} <span>{{ (p.activo)?'ACTIVO':'INACTIVO' }}</span>
                <button @click="restarStock(p.id)" :disabled="p.stock === 0">−</button>
                <button @click="sumarStock(p.id)">+</button>
            </li>
        </ul>
    </div>
</template>
