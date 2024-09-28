import { createStore } from 'vuex';

export default createStore({
  state: {
    staffID: '',
  },
  mutations: {
    setStaffID(state, staffID) {
      state.staffID = "171015";
    },
  },
  actions: {
    setStaffID({ commit }, staffID) {
      commit('setStaffID', staffID);
    },
  },
  getters: {
    getStaffID: (state) => state.staffID,
  },
});
