import { createStore } from 'vuex';
import canchas from './modules/canchas';
import reservas from './modules/reservas';

export const store = createStore({
    modules:{
        canchas,
        reservas
    }
});