import { createRouter, createWebHistory } from 'vue-router';
import staffMySchedule from '../views/staff/StaffMySchedule.vue';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/staffmyschedule',
      name: 'staffmyschedule',
      component: staffMySchedule,
    },
    {
      path: '/staffteamschedule',
      name: 'staffteamschedule',
      component: () => import('../views/staff/StaffTeamScheduleView.vue'),
    },
    {
      path: '/staffrequeststatus',
      name: 'staffrequeststatus',
      component: () => import('../views/staff/StaffRequestStatus.vue'),
    },
    {
      path: '/pending-requests',
      name: 'pending-requests',
      component: () => import('../views/DSAllRequestsView.vue'),
    },
    {
      path: '/applyArrangement',
      name: 'applyArrangement',
      component: () => import('../views/ApplyView.vue'),
    },
  ],
});

export default router;
