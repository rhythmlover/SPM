import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({});
  const staffID = ref('');
  const staffName = ref('');
  const approverID = ref('');
  const approverName = ref('');
  const currentSchedule = ref('');

  // const count = ref(0)
  // const doubleCount = computed(() => count.value * 2)
  // function increment() {
  //   count.value++
  // }

  const setUserInfo = (newInfo) => {
    userInfo.value = newInfo;
  };

  const setStaffName = (name) => {
    staffName.value = name;
  };

  const setApproverID = (id) => {
    approverID.value = id;
  };

  const setApproverName = (name) => {
    approverName.value = name;
  };

  const setCurrentSchedule = (schedule) => {
    currentSchedule.value = schedule;
  };

  const getStaffID = computed(() => staffID.value);
  const getStaffName = computed(() => staffName.value);
  const getApproverID = computed(() => approverID.value);
  const getApproverName = computed(() => approverName.value);
  const getCurrentSchedule = computed(() => currentSchedule.value);

  const login = async (id) => {
    try {
      const employeeResponse = await axios.get(`/employee/login?staffID=${id}`);
      const employee = employeeResponse.data;

      const staffNameResponse = await axios.get(`/employee/get-staff-name-by-id?staffID=${id}`);
      const staffName = staffNameResponse.data.name;

      const approverID = employee.Approver_ID;
      const approverNameResponse = await axios.get(
        `/employee/get-staff-name-by-id?staffID=${approverID}`,
      );
      const approverName = approverNameResponse.data.name;

      const scheduleResponse = await axios.get(`/wfh_request/user?staffID=${id}`);
      const currentSchedule = scheduleResponse.data.results;

      setUserInfo(employee);
      setStaffName(staffName);
      setApproverID(approverID);
      setApproverName(approverName);
      setCurrentSchedule(currentSchedule);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return {
    userInfo,
    setUserInfo,
    staffID,
    getStaffID,
    staffName,
    setStaffName,
    approverID,
    setApproverID,
    approverName,
    setApproverName,
    currentSchedule,
    setCurrentSchedule,
    getStaffName,
    getApproverID,
    getApproverName,
    getCurrentSchedule,
    login,
  };
});
