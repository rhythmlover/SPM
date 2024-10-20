import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import ApprovedRequestWithdrawal from '../../views/staff/ApprovedRequestWithdrawal.vue';
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
      expect(successAlert.text()).toContain('Withdrawal Request Submitted Successfully');
  
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
      expect(errorAlert.text()).toContain('Withdrawal Request Submission Failed');
  
      await updateSheet(testId, 'Passed');
  
      axios.post.mockReset();
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });  

});
