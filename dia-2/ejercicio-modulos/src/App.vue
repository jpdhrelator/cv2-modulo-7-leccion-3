<script setup>
import { ref } from 'vue';

import ShoppingCartLazy from './components/ShoppingCartLazy.vue';

const mostrarCart= ref(false);

</script>

<template>
  <div>
    <!-- <ShoppingCart/> -->
    <button @click="mostrarCart=!mostrarCart">
      <p v-if="mostrarCart"> Ocultar Carrito</p> 
      <p v-else> Mostrar Carrito</p>
      </button>
    <div v-if="mostrarCart">
      <ShoppingCartLazy/>

    </div>
  </div>
</template>
