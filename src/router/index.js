import { createRouter, createWebHistory } from 'vue-router'
import OrderListView from '../views/OrderListView.vue'
import OrderCreateView from '../views/OrderCreateView.vue'
import OrderEditView from '../views/OrderEditView.vue'
import OrderDetailView from '../views/OrderDetailView.vue'

const routes = [
    { path: '/', name: 'order-list', component: OrderListView },
    { path: '/create', name: 'order-create', component: OrderCreateView },
    { path: '/edit/:id', name: 'order-edit', component: OrderEditView },
    { path: '/detail/:id', name: 'order-detail', component: OrderDetailView }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})