import { createRouter, createWebHistory } from 'vue-router';
import StaffMySchedule from '../views/staff/StaffMySchedule.vue';
import HomeView from '../views/HomeView.vue';
import ApplyView from '../views/ApplyView.vue';
import DSAllRequestsView from '../views/DSAllRequestsView.vue';
import StaffRequestStatus from '../views/staff/StaffRequestStatus.vue';
import StaffTeamSchedule from '../views/staff/StaffTeamScheduleView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/staff-myschedule',
      name: 'staff-myschedule',
      component: StaffMySchedule,
    },
    {
      path: '/staff-teamschedule',
      name: 'staff-teamschedule',
      component: StaffTeamSchedule,
    },
    {
      path: '/staff-requeststatus',
      name: 'staff-requeststatus',
      component: StaffRequestStatus,
    },
    {
      path: '/pending-requests',
      name: 'pending-requests',
      component: DSAllRequestsView,
    },
    {
      path: '/apply-arrangement',
      name: 'apply-arrangement',
      component: ApplyView,
    },
    {
      path: '/staff-approved-requests-withdrawal',
      name: 'staff-approved-requests-withdrawal',
      component: () => import('../views/staff/ApprovedRequestWithdrawal.vue'),
    },
    {
      path: '/staff-requeststatus/:requestID/:WFH_Date/:Request_Period',
      name: 'WithdrawRequestForm',
      component: () => import('../views/staff/ApprovedRequestWithdrawal.vue'), 
      props: true
    }
  ],
});

export default router;
