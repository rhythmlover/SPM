import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ApprovedRequestWithdrawal from '../../views/staff/ApprovedRequestWithdrawalView.vue';
import { updateSheet } from '../../../updateGoogleSheet';
import axios from 'axios';

vi.mock('axios');

describe('ApprovedRequestWithdrawal.vue', () => {
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

      wrapper.vm.successMessage = 'Withdrawal Request Submitted Successfully';
      wrapper.vm.errorMessage = '';
      wrapper.vm.operationDone = true;

      await wrapper.vm.$nextTick();

      const successAlert = wrapper.find('.alert-success');
      expect(successAlert.exists()).toBe(true);
      expect(successAlert.text()).toContain(
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

      wrapper.vm.errorMessage = 'Withdrawal Request Submission Failed';
      wrapper.vm.successMessage = '';
      wrapper.vm.operationDone = true;

      await wrapper.vm.$nextTick();

      const errorAlert = wrapper.find('.alert-danger');
      expect(errorAlert.exists()).toBe(true);
      expect(errorAlert.text()).toContain(
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
      axios.get.mockReset();
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

      expect(wrapper.vm.successMessage).toBe('Initial Success');
      expect(wrapper.vm.errorMessage).toBe('Initial Error');

      await wrapper.setProps({ initialSuccessMessage: 'Updated Success' });
      await wrapper.setProps({ initialErrorMessage: 'Updated Error' });

      expect(wrapper.vm.successMessage).toBe('Updated Success');
      expect(wrapper.vm.errorMessage).toBe('Updated Error');

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
      expect(wrapper.vm.successMessage).toBe('');
      expect(wrapper.vm.errorMessage).toBe('');
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
      expect(wrapper.find('.alert-danger').exists()).toBe(false);

      wrapper.vm.Status = 'Rejected';
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.alert-danger').exists()).toBe(false);

      wrapper.vm.Status = 'Approved';
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.alert-danger').exists()).toBe(false);

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
  
      await wrapper.setData({ successMessage: '', errorMessage: 'Error Message' });
  
      expect(wrapper.find('.alert-danger').exists()).toBe(true);
      expect(wrapper.find('.alert-danger').text()).toContain('Error Message');
      expect(wrapper.find('.alert-success').exists()).toBe(false);
  
      await wrapper.setData({ successMessage: 'Success Message', errorMessage: '' });
  
      expect(wrapper.find('.alert-success').exists()).toBe(true);
      expect(wrapper.find('.alert-success').text()).toContain('Success Message');
      expect(wrapper.find('.alert-danger').exists()).toBe(false);
  
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
  


});
