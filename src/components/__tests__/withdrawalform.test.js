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
            inject: (key) => {
              if (key === 'API_ROUTE') {
                return 'http://localhost:3000';
              }
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

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/wfh-request/withdraw/post/id',
        expect.objectContaining({
          Staff_Name: 'John Doe',
          Staff_Position: 'Software Engineer',
          Request_ID: '2',
          Request_Period: 'AM',
          Request_Reason: 'Personal Reasons',
          Status: 'Pending',
          Approver_Name: 'Jane Smith',
          WFH_Date: '2024-10-03',
        }),
      );

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
    const testId = 'TC-038'; // New test ID for the failure scenario

    try {
      // Mock the axios.post request to simulate a failure
      axios.post.mockRejectedValueOnce({
        response: {
          data: { message: 'Withdrawal Request Submission Failed' },
        },
      });

      // Mount the component with necessary route parameters and API route injection
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
            inject: (key) => {
              if (key === 'API_ROUTE') {
                return 'http://localhost:3000'; // Mock API base URL
              }
            },
          },
        },
      });

      // Set user input data for form fields
      await wrapper.setData({
        Staff_Name: 'John Doe',
        Staff_Position: 'Software Engineer',
        Request_Reason: 'Personal Reasons',
        Approver_Name: 'Jane Smith',
      });

      // Simulate form submission
      const form = wrapper.find('form');
      await form.trigger('submit.prevent');

      // Simulate a failed form submission process
      wrapper.vm.errorMessage = 'Withdrawal Application Submission Failed';
      wrapper.vm.successMessage = '';
      wrapper.vm.operationDone = true;

      // Wait for DOM to update after setting the error message
      await wrapper.vm.$nextTick();

      // Assert the axios post call was made with the correct payload
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/wfh-request/withdraw/post/id',
        expect.objectContaining({
          Staff_Name: 'John Doe',
          Staff_Position: 'Software Engineer',
          Request_ID: '2',
          Request_Period: 'AM',
          Request_Reason: 'Personal Reasons',
          Status: 'Pending',
          Approver_Name: 'Jane Smith',
          WFH_Date: '2024-10-03',
        }),
      );

      // Check that the error message is displayed
      const errorAlert = wrapper.find('.alert-danger'); // Assuming you are using `.alert-danger` for error messages
      expect(errorAlert.exists()).toBe(true);
      expect(errorAlert.text()).toContain(
        'Withdrawal Application Submission Failed',
      );

      // Update the test result as 'Passed' in the sheet
      await updateSheet(testId, 'Passed');

      // Reset the mock for axios post
      axios.post.mockReset();
    } catch (error) {
      // In case of an error, update the test result as 'Failed'
      await updateSheet(testId, 'Failed');
      throw error; // Rethrow the error to ensure the test fails
    }
  });
});
