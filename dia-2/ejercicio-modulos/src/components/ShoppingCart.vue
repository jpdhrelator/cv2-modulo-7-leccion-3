<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const availableProducts = [
    { id: 101, name: 'Teclado Mecánico', price: 85 },
    { id: 102, name: 'Mouse Gamer', price: 45 },
    { id: 103, name: 'Monitor 24"', price: 180 }
];
const isLogin = computed(() => store.state.isLogin);
const cartItems = computed(() => store.state.cart.items);
const isProcessing = computed(() => store.state.cart.isProcessing);
const checkoutStatus = computed(() => store.state.cart.checkoutStatus);

const totalItems = computed(() => store.getters['cart/totalItems']);
const totalPrice = computed(() => store.getters['cart/totalPrice']);
console.log('totalPrice',totalPrice);

const handleAddToCart = (product) => {
    store.dispatch('cart/addToCart', product);
};
const handleCheckout = () => {
    store.dispatch('cart/checkout')
}

</script>
<template>
    <div class="shop-container">
        <section class="products">
            <h3>Catálogo</h3>
            <ul>
                <li v-for="product in availableProducts" :key="product.id">
                    <span>{{ product.name }} - ${{ product.price }}</span>
                    <button @click="handleAddToCart(product)">Agregar</button>
                </li>
            </ul>
        </section>
        <section class="cart">
            <h3>Tu Carrito ({{ totalItems }} ítems)</h3>
            <p v-if="cartItems.length === 0">El carrito está vacío.</p>
            <ul v-else>
                <li v-for="item in cartItems" :key="item.id">
                    {{ item.name }} x {{ item.quantity }} — <strong>${{ item.price * item.quantity }}</strong>
                </li>
            </ul>

            <div v-if="cartItems.length > 0" class="summary">
                <h4>Total: ${{ totalPrice }}</h4>
                <button :disabled="isProcessing" @click="handleCheckout">
                    {{ isProcessing ? 'Procesando pago...' : 'Pagar Ahora' }}
                </button>
            </div>

            <!-- Feedback de la operación -->
            <p v-if="checkoutStatus === 'SUCCESS'" class="msg-success">
                ¡Compra realizada con éxito!
            </p>
            <p v-if="checkoutStatus === 'ERROR'" class="msg-error">
                Ocurrió un error al procesar el pago.
            </p>
        </section>
    </div>
</template>
<style scoped>
.shop-container {
    max-width: 450px;
    font-family: sans-serif;
    border: 1px solid #ddd;
    padding: 1.5rem;
    border-radius: 8px;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.msg-success {
    color: green;
    font-weight: bold;
}

.msg-error {
    color: red;
    font-weight: bold;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>