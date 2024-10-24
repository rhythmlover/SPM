import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import StaffRequestStatus from '../../views/staff/StaffRequestStatus.vue';
import { updateSheet } from '../../../updateGoogleSheet';
import { createRouter, createMemoryHistory } from 'vue-router';
import axios from 'axios';

vi.mock('axios');

const routes = [
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

describe('StaffRequestStatus.vue', () => {
  const request = [
    {
      Staff_ID: 171015,
      Request_ID: 1,
      Request_Reason: 'Personal',
      WFH_Date: '2024-10-01',
      Request_Date: '2024-09-25',
      Status: 'Pending',
      showWithdrawButton: true,
      Comments: 'Some comments',
      Request_Period: 'AM',
    },
  ];

  const request_approved = [
    {
      Staff_ID: 171015,
      Request_ID: 2,
      Request_Reason: 'Personal',
      WFH_Date: '2024-10-03',
      Request_Date: '2024-09-25',
      Status: 'Approved',
      showWithdrawButton: true,
      Comments: 'Some comments',
      Request_Period: 'AM',
    },
  ];

  const request_out_of_period = [
    {
      Staff_ID: 171015,
      Request_ID: 3,
      Request_Reason: 'Personal',
      WFH_Date: '2025-01-03',
      Request_Date: '2024-09-25',
      Status: 'Approved',
      showWithdrawButton: false,
      Comments: 'Some comments',
      Request_Period: 'PM',
    },
  ];

  const request_pending_withdrawal = [
    {
      Staff_ID: 171015,
      Request_ID: 5,
      Request_Reason: 'Personal',
      WFH_Date: '2024-11-01',
      Request_Date: '2024-09-25',
      Status: 'Withdrawal Pending',
      showWithdrawButton: false,
      Comments: 'Some comments',
      Request_Period: 'FULL',
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
      expect(headers[0].text()).toBe('Reason for Request');
      expect(headers[1].text()).toBe('WFH Date');
      expect(headers[2].text()).toBe('Requested On');
      expect(headers[3].text()).toBe('Status');
      expect(headers[4].text()).toBe('Actions');
      expect(headers[5].text()).toBe('Comments');
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

      expect(wrapper.vm.$router.currentRoute.value.name).toBe(
        'staff-approved-requests-withdrawal',
      );
      expect(wrapper.vm.$router.currentRoute.value.params).toMatchObject({
        requestID: '2',
        WFH_Date: '2024-10-03',
        Request_Period: 'AM',
      });

      await updateSheet(testId, 'Passed');
      confirmMock.mockRestore();
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  // it('Status of Withdrawal Updated to Withdrawal Pending', async () => {
  //   const testId = 'TC-039';
  //   try {
  //     const wrapper = mount(StaffRequestStatus, {
  //       props: {
  //         requests: request_approved,
  //       },
  //     });
  //     const requestRows = wrapper.findAll('tbody tr');
  //     expect(requestRows.length).toBe(request_approved.length);

  //     // const statusCell = requestRows[0].findAll('td').at(3);
  //     // expect(statusCell.text()).toContain('Approved');
  //     let statusCell = requestRows[0].find('td.col-2');
  //   expect(statusCell.exists()).toBe(true);

  //   let badge = statusCell.find('BBadge');
  //   expect(badge.exists()).toBe(true);

  //   // Verify the class for the approved badge
  //   expect(badge.classes()).toContain('badge-success');

  //   // Verify the text for 'Approved'
  //   expect(badge.text()).toBe('Approved');

  //     let withdrawButton = requestRows[0].find('.btn-danger');
  //     expect(withdrawButton.exists()).toBe(true);

  //     await wrapper.setProps({
  //       requests: [
  //         {
  //           ...request_approved[0],
  //           Status: 'Withdrawal Pending',
  //           showWithdrawButton: false,
  //         },
  //       ],
  //     });

  //     const updatedRequestRows = wrapper.findAll('tbody tr');
  //   statusCell = updatedRequestRows[0].find('td.col-2');
  //   expect(statusCell.exists()).toBe(true);

  //   badge = statusCell.find('BBadge');
  //   expect(badge.exists()).toBe(true);
  //   expect(badge.classes()).toContain('badge-light');
  //   expect(badge.text()).toBe('Withdrawal Pending');
  //     // const updatedStatusCell = requestRows[0].findAll('td').at(3);
  //     // expect(updatedStatusCell.text()).toBe('Withdrawal Pending');

  //     withdrawButton = requestRows[0].find('.btn-danger');
  //     expect(withdrawButton.exists()).toBe(false);

  //     await updateSheet(testId, 'Passed');
  //   } catch (error) {
  //     await updateSheet(testId, 'Failed');
  //     throw error;
  //   }
  // });

  it('Status of Withdrawal Updated to Withdrawal Pending', async () => {
    const testId = 'TC-039';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: {
          requests: request_approved, // Initial data with 'Approved' status
        },
      });

      const requestRows = wrapper.findAll('tbody tr');
      expect(requestRows.length).toBe(request_approved.length);

      let statusCell = requestRows[0].findAll('td').at(3);
      expect(statusCell.exists()).toBe(true);

      const badge = statusCell.find('.text-bg-success');
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe('Approved');

      let withdrawButton = requestRows[0].find('.btn-danger');
      expect(withdrawButton.exists()).toBe(true);

      // Simulate the status update by changing the props
      await wrapper.setProps({
        requests: [
          {
            ...request_approved[0],
            Status: 'Withdrawal Pending', // Change the status to Withdrawal Pending
            showWithdrawButton: false, // Update to hide the Withdraw button
          },
        ],
      });

      statusCell = requestRows[0].findAll('td').at(3);
      expect(statusCell.exists()).toBe(true);

      const badge_pending_withdrawal = statusCell.find('.text-bg-light');
      expect(badge_pending_withdrawal.exists()).toBe(true);
      expect(badge_pending_withdrawal.text()).toBe('Withdrawn');

      withdrawButton = requestRows[0].find('.btn-danger');
      expect(withdrawButton.exists()).toBe(false);

      // Mark the test as passed
      await updateSheet(testId, 'Passed');
    } catch (error) {
      // In case of error, mark as failed
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

      expect(requestRows.length).toBe(request_pending_withdrawal.length);

      const statusCell = requestRows[0].findAll('td').at(3);
      expect(statusCell.text()).toBe('Withdrawn');

      await wrapper.setProps({
        requests: [
          {
            ...request_pending_withdrawal[0],
            Status: 'Withdrawn',
            showWithdrawButton: false,
          },
        ],
      });

      const updatedStatusCell = requestRows[0].findAll('td').at(3);
      const status_approved = updatedStatusCell.find('.text-bg-secondary');
      expect(status_approved.exists()).toBe(true);
      expect(status_approved.text()).toBe('Withdrawn');

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

      expect(requestRows.length).toBe(request_pending_withdrawal.length);

      const statusCell = requestRows[0].findAll('td').at(3);
      expect(statusCell.text()).toBe('Withdrawn');

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

      const updatedStatusCell = requestRows[0].findAll('td').at(3);
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
