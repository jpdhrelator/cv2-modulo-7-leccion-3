import { createStore } from 'vuex';
import cart from './modules/cart';


export default createStore({

    state: ()=>({
        isLogin:true
    }),
    // modules:{
    //     cart
    // }
});