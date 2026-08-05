import { createRouter, createWebHistory } from 'vue-router';
import PanelView from '../views/PanelView.vue';
import ReservasView from '../views/ReservasView.vue';
import CanchasView from '../views/CanchasView.vue';
import ReservaFormView from '../views/ReservaFormView.vue';


const routes = [
    {
        path: '/',
        name: 'panel',
        component: PanelView
    },
    {
        path: '/reservas',
        name: 'reservas',
        component: ReservasView
    },
    {
        path: '/canchas',
        name: 'canchas',
        component: CanchasView
    },
    {
        path: '/reservas/nueva',
        name: 'reserva-nueva',
        component: ReservaFormView
    },
{
        path: '/reservas/:id',
        name: 'reserva-editar',
        component: ReservaFormView,
        props: true
    },
    {
        // Cualquier cosa que no calce con nada vuelve al panel.
        path: '/:rutaNoEncontrada(.*)*',
        redirect: { name: 'panel' }
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});