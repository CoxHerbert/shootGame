import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import App from '@/ui/App.vue';
import '@/styles/tailwind.css';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('@/ui/pages/Home.vue') },
    { path: '/battle', component: () => import('@/ui/pages/Battle.vue') },
  ],
});

createApp(App).use(createPinia()).use(router).mount('#app');
