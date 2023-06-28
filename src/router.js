import * as VueRouter from 'vue-router';
import Home from '@/page/home.vue';

const routes = [
    { path: '/', component: Home, name: "Home", meta: { isadmin: false } },
]

export const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
})