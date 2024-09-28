import { createRouter, createWebHistory } from 'vue-router';
import staffMySchedule from '../views/staff/StaffMySchedule.vue';
import HomeView from '../views/HomeView.vue';
import StaffView from '../views/StaffView.vue';
import TestView from '@/views/TestView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/staff',
      name: 'staff',
      component: StaffView,
    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
    },
    {
      path: '/staffmyschedule',
      name: 'staffmyschedule',
      component: staffMySchedule,
    },
    {
      path: '/staffteamschedule',
      name: 'staffteamschedule',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/staff/StaffTeamSchedule.vue'),
    },
    {
      path: '/staffrequeststatus',
      name: 'staffrequeststatus',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/staff/StaffRequestStatus.vue'),
    },
    {
      path: '/pending-requests',
      name: 'pending-requests',
      component: () => import('../views/DSPendingRequests.vue'),
    },
    {
      path: '/applyArrangement',
      name: 'applyArrangement',
      component: () => import('../views/ApplyView.vue'),
    },
  ],
});

export default router;
