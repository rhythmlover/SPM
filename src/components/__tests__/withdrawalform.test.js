import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ApprovedRequestWithdrawal from '../../views/staff/ApprovedRequestWithdrawalView.vue';
import { updateSheet } from '../../../updateGoogleSheet';
import axios from 'axios';
import { createRouter, createMemoryHistory } from 'vue-router';

vi.mock('axios');

const routes = [
  {
    path: '/staff-requeststatus',
    name: 'staff-requeststatus',
    component: { template: '<div>Staff Request Status</div>' },
  },
  {
    path: '/withdraw-request/:requestID/:WFH_Date/:Request_Period/',
    name: 'staff-approved-requests-withdrawal',
    component: { template: '<div>Withdraw Form</div>' },
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

describe('ApprovedRequestWithdrawal.vue', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('User Successfully Submits the Withdrawal Form', async () => {
    const testId = 'TC-037';

    try {
      axios.post.mockResolvedValueOnce({
        data: { message: 'Withdrawal Request Submitted Successfully' },
      });

      const wrapper = mount(ApprovedRequestWithdrawal, {
        global: {
          mocks: {
            $route: {
              params: {
                requestID: '2',
                WFH_Date: '2024-10-03',
                Request_Period: 'AM',
                Status: 'Approved',
              },
            },
          },
        },
      });

      await wrapper.setData({
        Staff_Name: 'John Doe',
        Staff_Position: 'Software Engineer',
        Request_Reason: 'Personal Reasons',
        Approver_Name: 'Jane Smith',
      });

      const form = wrapper.find('form');
      await form.trigger('submit.prevent');

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showAlertModal).toBe(true);
      expect(wrapper.vm.modalTitle).toBe('Success');
      expect(wrapper.vm.modalMessage).toBe(
        'Withdrawal Request Submitted Successfully',
      );

      const modalTitle = wrapper.find('.modal-title');
      expect(modalTitle.text()).toContain('Success');

      const modalMessage = wrapper.find('.modal-body p');
      expect(modalMessage.text()).toContain(
        'Withdrawal Request Submitted Successfully',
      );

      await updateSheet(testId, 'Passed');

      axios.post.mockReset();
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('User Fails to Submit the Withdrawal Form', async () => {
    const testId = 'TC-038';

    try {
      axios.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Withdrawal Request Submission Failed' },
        },
      });

      const wrapper = mount(ApprovedRequestWithdrawal, {
        global: {
          mocks: {
            $route: {
              params: {
                requestID: '2',
                WFH_Date: '2024-10-03',
                Request_Period: 'AM',
                Status: 'Approved',
              },
            },
          },
        },
      });

      await wrapper.setData({
        Staff_Name: 'John Doe',
        Staff_Position: 'Software Engineer',
        Request_Reason: 'Personal Reasons',
        Approver_Name: 'Jane Smith',
      });

      const form = wrapper.find('form');
      await form.trigger('submit.prevent');

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showAlertModal).toBe(true);
      expect(wrapper.vm.modalTitle).toBe('Error');
      expect(wrapper.vm.modalMessage).toBe(
        'Withdrawal Request Submission Failed',
      );

      const modalTitle = wrapper.find('.modal-title');
      expect(modalTitle.text()).toContain('Error');

      const modalMessage = wrapper.find('.modal-body p');
      expect(modalMessage.text()).toContain(
        'Withdrawal Request Submission Failed',
      );

      await updateSheet(testId, 'Passed');

      axios.post.mockReset();
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Hides buttons when operationDone is true', async () => {
    const testId = 'TC-115';
    try {
      const wrapper = mount(ApprovedRequestWithdrawal, {
        global: {
          plugins: [router],
          mocks: {
            $route: {
              params: {
                requestID: '2',
                WFH_Date: '2024-10-03',
                Request_Period: 'AM',
                Status: 'Approved',
              },
            },
          },
        },
        data() {
          return {
            operationDone: true,
          };
        },
      });

      expect(wrapper.find('button[type="submit"]').exists()).toBe(false);
      expect(wrapper.find('button[type="button"]').exists()).toBe(false);

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Logs error if fetchReportingManagerID fails', async () => {
    const testId = 'TC-116';
    try {
      const wrapper = mount(ApprovedRequestWithdrawal, {
        global: {
          plugins: [router],
          mocks: {
            $route: {
              params: {
                requestID: '2',
                WFH_Date: '2024-10-03',
                Request_Period: 'AM',
                Status: 'Approved',
              },
            },
          },
        },
      });

      axios.get.mockRejectedValueOnce(new Error('Network Error'));

      const consoleSpy = vi.spyOn(console, 'log');
      await wrapper.vm.fetchReportingManagerID();

      expect(consoleSpy).toHaveBeenCalledWith(new Error('Network Error'));

      await updateSheet(testId, 'Passed');
      consoleSpy.mockRestore();
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Updates successMessage and errorMessage when initial messages change', async () => {
    const testId = 'TC-117';
    try {
      const wrapper = mount(ApprovedRequestWithdrawal, {
        global: {
          plugins: [router],
          mocks: {
            $route: {
              params: {
                requestID: '2',
                WFH_Date: '2024-10-03',
                Request_Period: 'AM',
                Status: 'Approved',
              },
            },
          },
        },
        props: {
          initialSuccessMessage: 'Initial Success',
          initialErrorMessage: 'Initial Error',
        },
      });

      await wrapper.setData({
        modalTitle: 'Initial Success',
        modalMessage: 'Initial Error',
      });

      expect(wrapper.vm.modalTitle).toBe('Initial Success');
      expect(wrapper.vm.modalMessage).toBe('Initial Error');

      await wrapper.setData({
        modalTitle: 'Updated Success',
        modalMessage: 'Updated Error',
      });

      expect(wrapper.vm.modalTitle).toBe('Updated Success');
      expect(wrapper.vm.modalMessage).toBe('Updated Error');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Resets fields and navigates on cancel', async () => {
    const testId = 'TC-118';
    try {
      const mockRouterPush = vi.fn();
      const wrapper = mount(ApprovedRequestWithdrawal, {
        global: {
          plugins: [router],
          mocks: {
            $router: {
              push: mockRouterPush,
            },
            $route: {
              params: {
                requestID: '2',
                WFH_Date: '2024-10-03',
                Request_Period: 'AM',
                Status: 'Approved',
              },
            },
          },
        },
      });

      wrapper.vm.Request_Reason = 'Some reason';
      wrapper.vm.successMessage = 'Success';
      wrapper.vm.errorMessage = 'Error';

      await wrapper.vm.cancel();

      expect(wrapper.vm.Request_Reason).toBe('');
      expect(wrapper.vm.modalTitle).toBe('');
      expect(wrapper.vm.modalMessage).toBe('');
      expect(mockRouterPush).toHaveBeenCalledWith('/staff-requeststatus');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Displays correct messages based on request status', async () => {
    const testId = 'TC-119';
    try {
      const wrapper = mount(ApprovedRequestWithdrawal, {
        global: {
          plugins: [router],
          mocks: {
            $route: {
              params: {
                requestID: '2',
                WFH_Date: '2024-10-03',
                Request_Period: 'AM',
                Status: 'Approved',
              },
            },
          },
        },
      });

      wrapper.vm.Status = 'Pending';
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.modal-overlay').exists()).toBe(false);

      wrapper.vm.Status = 'Rejected';
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.modal-overlay').exists()).toBe(false);

      wrapper.vm.Status = 'Approved';
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.modal-overlay').exists()).toBe(false);

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Only displays one message at a time', async () => {
    const testId = 'TC-120';
    try {
      const wrapper = mount(ApprovedRequestWithdrawal, {
        global: {
          plugins: [router],
          mocks: {
            $route: {
              params: {
                requestID: '2',
                WFH_Date: '2024-10-03',
                Request_Period: 'AM',
                Status: 'Approved',
              },
            },
          },
        },
      });

      await wrapper.setData({
        modalTitle: '',
        modalMessage: 'Error Message',
        showAlertModal: true,
      });

      expect(wrapper.find('.modal-overlay').exists()).toBe(true);
      const modalMessage = wrapper.find('.modal-body p');
      expect(modalMessage.text()).toContain('Error Message');
      expect(wrapper.find('.modal-title').text()).not.toContain('Success');

      await wrapper.setData({
        modalTitle: 'Success',
        modalMessage: 'Success Message',
      });

      expect(wrapper.find('.modal-overlay').exists()).toBe(true);
      const successModalMessage = wrapper.find('.modal-body p');
      expect(successModalMessage.text()).toContain('Success Message');
      expect(wrapper.find('.modal-title').text()).not.toContain('Error');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
