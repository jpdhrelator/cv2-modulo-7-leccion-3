import { createStore } from 'vuex'
import canchas from './modules/canchas'
import reservas from './modules/reservas'
import personal from './modules/personal'

export const store = createStore({
    modules: { canchas, reservas, personal }
})