import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Logs from '../views/Logs.vue';
import Settings from '../views/Settings.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/logs', component: Logs },
    { path: '/settings', component: Settings },
  ]
});
