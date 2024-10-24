import { createRouter, createWebHistory } from 'vue-router';
import StaffMySchedule from '../views/staff/StaffMySchedule.vue';
import HomeView from '../views/HomeView.vue';
import ApplyView from '../views/ApplyView.vue';
import DSAllRequestsView from '../views/DSAllRequestsView.vue';
import ManagerViewSchedule from '@/views/manager/ManagerViewSchedule.vue';
import StaffRequestStatus from '../views/staff/StaffRequestStatus.vue';
import StaffTeamSchedule from '../views/staff/StaffTeamScheduleView.vue';
import ApplyRecurringView from '../views/ApplyRecurringView.vue';
import HrViewSchedule from '@/views/hr/HrViewSchedule.vue';
import StaffApprovedRequestWithdrawal from '../views/staff/ApprovedRequestWithdrawalView.vue';
import StaffRequestHistory from '../views/staff/StaffRequestHistory.vue';

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
      path: '/apply-arrangement',
      name: 'apply-arrangement',
      component: ApplyView,
    },
    {
      path: '/apply-arrangement-recurring',
      name: 'apply-arrangement-recurring',
      component: ApplyRecurringView,
    },
    {
      path: '/pending-requests',
      name: 'pending-requests',
      component: DSAllRequestsView,
    },
    {
      path: '/hr-view-schedule',
      name: 'hr-view-schedule',
      component: HrViewSchedule,
    },
    {
      path: '/manager-view-schedule',
      name: 'manager-view-schedule',
      component: ManagerViewSchedule,
    },
    {
      path: '/staff-approved-requests-withdrawal/:requestID/:WFH_Date/:Request_Period/',
      name: 'staff-approved-requests-withdrawal',
      component: StaffApprovedRequestWithdrawal,
      props: true,
    },
    {
      path: '/staff-request-history',
      name: 'staff-request-history',
      component: StaffRequestHistory,
    },
  ],
});

export default router;
