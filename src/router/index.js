import { createRouter, createWebHistory } from 'vue-router';
import staffMySchedule from '../views/staffMySchedule.vue';
import HomeView from '../views/HomeView.vue';
import StaffView from '../views/StaffView.vue';
import TestView from '@/views/TestView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/staff',
      name: 'staff',
      component: StaffView,
      // component: () => import('../views/StaffView.vue'),
    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
    },
    {
      path: '/staffMySchedule',
      name: 'staffMySchedule',
      component: staffMySchedule,
    },
    {
      path: '/staffTeamSchedule',
      name: 'staffTeamSchedule',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/staffTeamSchedule.vue'),
    },
    {
      path: '/staffRequestStatus',
      name: 'staffRequestStatus',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/StaffRequestStatus.vue'),
    },
  ],
});

export default router;
