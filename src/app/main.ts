import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from '@/ui/App.vue';
import '@/styles/tailwind.css';

const routes = [
  { path: '/', component: () => import('@/ui/pages/Home.vue') },
  { path: '/battle', component: () => import('@/ui/pages/Battle.vue') }
];

const router = createRouter({ history: createWebHashHistory(), routes });

createApp(App).use(createPinia()).use(router).mount('#app');
