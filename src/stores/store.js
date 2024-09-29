import { createStore } from 'vuex';

export default createStore({
  state: {
    staffID: '',
  },
  getters: {
    getStaffID: (state) => state.staffID,
  },
});
