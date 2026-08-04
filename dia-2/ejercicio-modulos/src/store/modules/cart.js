export default {
    namespaced: true,

    state: () => ({
        items: [],
        isProcessing: false,
        checkoutStatus: null
    }),
    getters: {
        totalItems: (state) => {
            return state.items.reduce((total, item) => total + item.quantity, 0)
        },
        totalPrice: (state) => {
            return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
        }
    }, mutations: {
        ADD_TO_CART(state, product) {
            const existingItem = state.items.find(item => item.id === product.id);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                state.items.push({ ...product, quantity: 1 })
            }
        },
        SET_PROCESSING(state, status) {
            state.isProcessing = status;
        },
        SET_CHECKOUT_STATUS(state, status) {
            state.checkoutStatus = status;
        },
        CLEAR_CART(state) {
            state.items = [];
        }
    },
    actions: {
        addToCart({ commit }, product) {
            commit('ADD_TO_CART', product);
        },
        async checkout({ commit ,state}) {
            console.log(state);
            
            if (state.items.length === 0) return
            commit('SET_PROCESSING', true);
            commit('SET_CHECKOUT_STATUS', null);

            try {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                commit('CLEAR_CART');
                commit('SET_CHECKOUT_STATUS', 'SUCCESS');
            } catch (error) {
                commit('SET_CHECKOUT_STATUS', 'ERROR');
            } finally {
                commit('SET_PROCESSING', false);
            }

        }
    }


}