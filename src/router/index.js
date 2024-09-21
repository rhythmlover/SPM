import { createRouter, createWebHistory } from "vue-router";
import staffMySchedule from "../views/staffMySchedule.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/staffMySchedule",
      name: "staffMySchedule",
      component: staffMySchedule,
    },
    {
      path: "/staffTeamSchedule",
      name: "staffTeamSchedule",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/staffTeamSchedule.vue"),
    },
    {
      path: "/staffRequestStatus",
      name: "staffRequestStatus",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/StaffRequestStatus.vue"),
    },
  ],
});

export default router;
