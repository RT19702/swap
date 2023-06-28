import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router'
import Vant from 'vant';
import 'animate.css';
import 'vant/lib/index.css';
import { create } from 'naive-ui'
import { createPinia } from 'pinia'
const naive = create({})
const app = createApp(App)
app.use(router).use(createPinia()).use(Vant).use(naive).mount('#app');