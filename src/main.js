import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import store from '@/stores/store';
import { createBootstrap } from 'bootstrap-vue-next';

import App from './App.vue';
import router from './router';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';

import './assets/custom.css';

const app = createApp(App);

app.use(store);
app.use(createBootstrap());
app.use(createPinia());
app.use(router);

app.mount('#app');
