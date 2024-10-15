import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import StaffRequestStatus from '../../views/staff/StaffRequestStatus.vue';
import { updateSheet } from '../../../updateGoogleSheet';
import { createRouter, createMemoryHistory } from 'vue-router';
import axios from 'axios';

vi.mock('axios');

const routes = [
  {
    path: '/withdraw-request/:requestID/:WFH_Date/:Request_Period/:Status',
    name: 'WithdrawRequestForm',
    component: { template: '<div>Withdraw Form</div>' },
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});


describe('StaffRequestStatus.vue', () => {
  const request = [
    {
      Staff_ID: 171015,
      Request_ID: 1,
      Request_Date: '2024-09-25',
      WFH_Date: '2024-10-01',
      Request_Period: 'PM',
      Request_Reason: 'Personal',
      Status: 'Pending',
      showWithdrawButton: true,
    },
  ];

  const request_approved = [
    {
      Staff_ID: 171015,
      Request_ID: 2,
      Request_Date: '2024-09-25',
      WFH_Date: '2024-10-03',
      Request_Period: 'AM',
      Request_Reason: 'Personal',
      Status: 'Approved',
      showWithdrawButton: true,
    },
  ];

  const request_out_of_period = [
    {
      Staff_ID: 171015,
      Request_ID: 4,
      Request_Date: '2024-09-25',
      WFH_Date: '2025-01-03',
      Request_Period: 'AM',
      Request_Reason: 'Personal',
      Status: 'Approved',
      showWithdrawButton: false,
    },
  ];

  const request_pending_withdrawal = [
    {
      Staff_ID: 171015,
      Request_ID: 5,
      Request_Date: '2024-09-25',
      WFH_Date: '2024-11-01',
      Request_Period: 'AM',
      Request_Reason: 'Personal',
      Status: 'Withdrawal Pending',
      showWithdrawButton: false,
    },
  ];

  it('User Cancels Process of Deleting Pending Request', async () => {
    const testId = 'TC-022';
    try {
      const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request, status: 'pending' },
      });

      await wrapper.find('.btn-warning').trigger('click');
      expect(confirmMock).toHaveBeenCalled();
      expect(confirmMock).toHaveReturnedWith(false);
      expect(wrapper.vm.localRequests.length).toBe(1);

      await updateSheet(testId, 'Passed');
      confirmMock.mockRestore();
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });


  it('Successful Deletion of Pending Request', async () => {
    const testId = 'TC-023';
    axios.delete.mockResolvedValueOnce({
      data: { message: 'Request deleted successfully' },
    });
    try {
      const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request, status: 'pending' },
      });

      await wrapper.find('.btn-warning').trigger('click');
      expect(confirmMock).toHaveBeenCalled();
      expect(confirmMock).toHaveReturnedWith(true);
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.localRequests.length).toBe(0);

      await updateSheet(testId, 'Passed');
      confirmMock.mockRestore();
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });


  it('Render correct table headings', async () => {
    const testId = 'TC-025';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: {
          requests: request,
          status: 'pending',
        },
      });
      const headers = wrapper.findAll('th');
      expect(headers[0].text()).toBe('Staff ID');
      expect(headers[1].text()).toBe('Request ID');
      expect(headers[2].text()).toBe('Application Date');
      expect(headers[3].text()).toBe('WFH Date');
      expect(headers[4].text()).toBe('Request Period');
      expect(headers[5].text()).toBe('Request Reason');
      expect(headers[6].text()).toBe('Status');
      expect(headers[7].text()).toBe('Action');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Render correct number of WFH Requests', async () => {
    const testId = 'TC-026';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: {
          requests: request,
        },
      });
      const requestRows = wrapper.findAll('tbody tr');
      console.log(requestRows.length);
      expect(requestRows.length).toBe(request.length);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });


  it('User Cancels Process of Withdrawing Approved Request', async () => {
    const testId = 'TC-035';
    try {
      const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request_approved, status: 'approved' },
      });

      await wrapper.find('.btn-danger').trigger('click');
      expect(confirmMock).toHaveBeenCalled();
      expect(confirmMock).toHaveReturnedWith(false);
      expect(wrapper.vm.localRequests.length).toBe(1);

      await updateSheet(testId, 'Passed');
      confirmMock.mockRestore();
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('User Confirms Withdrawal of Approved Request', async () => {
    const testId = 'TC-036';
    try {
      const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request_approved, status: 'approved' },
        global: {
          plugins: [router],
        },
      });

      const withdrawButton = wrapper.find('.btn-danger');
      if (!withdrawButton.exists()) {
        throw new Error('Withdraw button not found');
      }

      await withdrawButton.trigger('click');
      await router.isReady();

      expect(confirmMock).toHaveBeenCalled();
      expect(confirmMock).toHaveReturnedWith(true);

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$router.currentRoute.value.name).toBe('WithdrawRequestForm');
      expect(wrapper.vm.$router.currentRoute.value.params).toMatchObject({
        requestID: '2',
        WFH_Date: '2024-10-03',
        Request_Period: 'AM',
        Status: 'Approved',
      });

      await updateSheet(testId, 'Passed');
      confirmMock.mockRestore();
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Status of Withdrawal Updated to Withdrawal Pending', async () => {
    const testId = 'TC-039';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: {
          requests: request_approved,
        },
      });
      const requestRows = wrapper.findAll('tbody tr');
      console.log(requestRows.length);

      expect(requestRows.length).toBe(request_approved.length);

      const statusCell = requestRows[0].findAll('td').at(6); 
      expect(statusCell.text()).toBe('Approved');

      let withdrawButton = requestRows[0].find('.btn-danger'); 
      expect(withdrawButton.exists()).toBe(true);

      await wrapper.setProps({
        requests: [
          {
            ...request_approved[0],
            Status: 'Withdrawal Pending',  
            showWithdrawButton: false,
          },
        ],
      });

      const updatedStatusCell = requestRows[0].findAll('td').at(6); 
      expect(updatedStatusCell.text()).toBe('Withdrawal Pending');

      withdrawButton = requestRows[0].find('.btn-danger'); 
      expect(withdrawButton.exists()).toBe(false);

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Status of Withdrawal Has Been Approved', async () => {
    const testId = 'TC-040';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: {
          requests: request_pending_withdrawal,
        },
      });
      const requestRows = wrapper.findAll('tbody tr');
      console.log(requestRows.length);

      expect(requestRows.length).toBe(request_pending_withdrawal.length);

      const statusCell = requestRows[0].findAll('td').at(6); 
      expect(statusCell.text()).toBe('Withdrawal Pending');

      let withdrawButton = requestRows[0].find('.btn-danger'); 
      expect(withdrawButton.exists()).toBe(false);

      await wrapper.setProps({
        requests: [
          {
            ...request_pending_withdrawal[0],
            Status: 'Withdrawn',  
            showWithdrawButton: false,
          },
        ],
      });

      const updatedStatusCell = requestRows[0].findAll('td').at(6); 
      expect(updatedStatusCell.text()).toBe('Withdrawn');

      withdrawButton = requestRows[0].find('.btn-danger'); 
      expect(withdrawButton.exists()).toBe(false);

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Status of Withdrawal Has Been Rejected', async () => {
    const testId = 'TC-041';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: {
          requests: request_pending_withdrawal,
        },
      });
      const requestRows = wrapper.findAll('tbody tr');
      console.log(requestRows.length);

      expect(requestRows.length).toBe(request_pending_withdrawal.length);

      const statusCell = requestRows[0].findAll('td').at(6); 
      expect(statusCell.text()).toBe('Withdrawal Pending');

      let withdrawButton = requestRows[0].find('.btn-danger'); 
      expect(withdrawButton.exists()).toBe(false);

      await wrapper.setProps({
        requests: [
          {
            ...request_pending_withdrawal[0],
            Status: 'Approved',  
            showWithdrawButton: true,
          },
        ],
      });

      const updatedStatusCell = requestRows[0].findAll('td').at(6); 
      expect(updatedStatusCell.text()).toBe('Approved');

      withdrawButton = requestRows[0].find('.btn-danger'); 
      expect(withdrawButton.exists()).toBe(true);

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Unable to submit request to withdraw an approved work arrangement more than 2 weeks back or before WFH Date', async () => {
    const testId = 'TC-042';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request_out_of_period },
      });

      const requestRow = wrapper.find('tbody tr');

      const withdrawButton = requestRow.find('.btn-danger');

      expect(withdrawButton.exists()).toBe(false);
      const requestData = wrapper.vm.localRequests[0];
      expect(requestData.showWithdrawButton).toBe(false);

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

});