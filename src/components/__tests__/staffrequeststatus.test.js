import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StaffRequestStatus from '../../views/staff/StaffRequestStatus.vue';
import { updateSheet } from '../../../updateGoogleSheet';
import { createRouter, createMemoryHistory } from 'vue-router';
import axios from 'axios';
import { nextTick } from 'vue';

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

const flushAll = async () => {
  await flushPromises();
  await nextTick();
};

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

  const request_not_pending = [
    {
      Staff_ID: 171015,
      Request_ID: 4,
      Request_Reason: 'Personal',
      WFH_Date: '2024-12-01',
      Request_Date: '2024-11-25',
      Status: 'Approved',
      showWithdrawButton: false,
      Comments: 'Some comments',
      Request_Period: 'PM',
    },
  ];

  const request_not_approved = [
    {
      Staff_ID: 171015,
      Request_ID: 6,
      Request_Reason: 'Personal',
      WFH_Date: '2024-12-05',
      Request_Date: '2024-11-25',
      Status: 'Rejected',
      showWithdrawButton: false,
      Comments: 'Some comments',
      Request_Period: 'FULL',
    },
  ];

  beforeEach(async () => {
    router.push('/');
    await router.isReady();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('User Cancels Process of Cancelling Pending Request', async () => {
    const testId = 'TC-022';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request, status: 'pending' },
        global: {
          plugins: [router],
        },
      });

      await wrapper.find('.btn-warning').trigger('click');

      expect(wrapper.vm.showModal).toBe(true);
      expect(wrapper.vm.modalTitle).toBe('Confirm Cancellation');
      expect(wrapper.vm.modalMessage).toBe(
        'Confirm cancellation of this pending request?',
      );

      const cancelButton = wrapper.find('.modal-footer .btn-secondary');
      await cancelButton.trigger('click');

      await flushPromises();

      expect(wrapper.vm.showModal).toBe(false);
      expect(wrapper.vm.localRequests.length).toBe(1);

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Successful Cancellation of Pending Request', async () => {
    const testId = 'TC-023';
    try {
      axios.put.mockResolvedValueOnce({
        data: { message: 'Request cancelled successfully' },
      });

      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request, status: 'pending' },
        global: {
          plugins: [router],
        },
      });

      await wrapper.find('.btn-warning').trigger('click');

      await wrapper.find('.modal-footer .btn-primary').trigger('click');

      await flushAll();

      expect(wrapper.vm.showModal).toBe(true);
      expect(wrapper.vm.modalTitle).toBe('Success');
      expect(wrapper.vm.modalMessage).toBe(
        'Request has been successfully cancelled.',
      );
      expect(wrapper.vm.localRequests.length).toBe(0);

      await updateSheet(testId, 'Passed');
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
        global: {
          plugins: [router],
        },
      });

      await wrapper.find('.btn-danger').trigger('click');
      expect(wrapper.vm.showModal).toBe(true);
      expect(wrapper.vm.modalTitle).toBe('Confirm Withdrawal');
      expect(wrapper.vm.modalMessage).toBe(
        'Send request to manager to approve withdrawal of this request?',
      );

      const cancelButton = wrapper.find('.modal-footer .btn-secondary');
      await cancelButton.trigger('click');

      expect(wrapper.vm.showModal).toBe(false);
      expect(wrapper.vm.localRequests.length).toBe(1);
      expect(wrapper.vm.$route.name).not.toBe(
        'staff-approved-requests-withdrawal',
      );

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
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request_approved },
        global: {
          plugins: [router],
        },
      });

      await wrapper.find('.btn-danger').trigger('click');

      expect(wrapper.vm.showModal).toBe(true);
      expect(wrapper.vm.modalTitle).toBe('Confirm Withdrawal');

      const confirmButton = wrapper.find('.modal-footer .btn-primary');
      await confirmButton.trigger('click');

      await flushAll();

      expect(wrapper.vm.showModal).toBe(false);

      // Wait for navigation
      await router.isReady();

      expect(wrapper.vm.$route.name).toBe('staff-approved-requests-withdrawal');
      expect(wrapper.vm.$route.params).toMatchObject({
        requestID: String(request_approved[0].Request_ID),
        WFH_Date: request_approved[0].WFH_Date,
        Request_Period: request_approved[0].Request_Period,
      });

      await updateSheet(testId, 'Passed');
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

      // Re-fetch request rows after props update
      const updatedRequestRows = wrapper.findAll('tbody tr');
      expect(updatedRequestRows.length).toBe(1); // Should still be 1

      statusCell = updatedRequestRows[0].findAll('td').at(3);
      expect(statusCell.exists()).toBe(true);

      const badge_pending_withdrawal = statusCell.find('.text-bg-light');
      expect(badge_pending_withdrawal.exists()).toBe(true);
      expect(badge_pending_withdrawal.text()).toBe('Withdrawal Pending'); // Fixed text

      withdrawButton = updatedRequestRows[0].find('.btn-danger');
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
          requests: request_pending_withdrawal, // Initial request with 'Withdrawal Pending' status
        },
      });

      const requestRows = wrapper.findAll('tbody tr');
      console.log('Initial request rows:', requestRows.length); // Log for debugging
      expect(requestRows.length).toBe(request_pending_withdrawal.length);

      const statusCell = requestRows[0].findAll('td').at(3);
      expect(statusCell.exists()).toBe(true);
      console.log('Initial status cell:', statusCell.html()); // Log for debugging
      expect(statusCell.text()).toBe('Withdrawal Pending'); // Verify initial status

      // Simulate changing the status to Approved
      await wrapper.setProps({
        requests: [
          {
            ...request_pending_withdrawal[0],
            Status: 'Approved', // Change status to Approved
            showWithdrawButton: false,
          },
        ],
      });

      // Wait for DOM updates
      await wrapper.vm.$nextTick();

      // Re-fetch request rows after props update
      const updatedRequestRows = wrapper.findAll('tbody tr');
      console.log('Updated request rows:', updatedRequestRows.length); // Log for debugging
      expect(updatedRequestRows.length).toBe(1); // Should still be 1

      const updatedStatusCell = updatedRequestRows[0].findAll('td').at(3);
      console.log('Updated status cell:', updatedStatusCell.html()); // Log for debugging
      expect(updatedStatusCell.exists()).toBe(true);

      const statusApproved = updatedStatusCell.find('.text-bg-success'); // Check if class for Approved is present
      expect(statusApproved.exists()).toBe(true); // This should now be true
      expect(statusApproved.text()).toBe('Approved'); // Verify the updated text

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
      expect(statusCell.text()).toBe('Withdrawal Pending'); // Fixed expected status

      let withdrawButton = requestRows[0].find('.btn-danger');
      expect(withdrawButton.exists()).toBe(false);

      await wrapper.setProps({
        requests: [
          {
            ...request_pending_withdrawal[0],
            Status: 'Approved', // Change status to Approved on rejection
            showWithdrawButton: false,
          },
        ],
      });

      const updatedStatusCell = requestRows[0].findAll('td').at(3);
      const status_approved = updatedStatusCell.find('.text-bg-success'); // Adjusted to correct class for approved
      expect(status_approved.exists()).toBe(true);
      expect(status_approved.text()).toBe('Approved'); // Verify the updated text

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

  it('Render correct number of columns in the table', async () => {
    const testId = 'TC-109';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request },
      });
      const headers = wrapper.findAll('th');
      expect(headers.length).toBe(6);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('cancelRequest method when request is not pending', async () => {
    const testId = 'TC-110';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request_not_pending },
        global: {
          plugins: [router],
        },
      });

      const cancelButton = wrapper.find('.btn-warning');
      expect(cancelButton.exists()).toBe(false);

      expect(wrapper.vm.showModal).toBe(false);

      await flushAll();

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('openWithdrawForm method when request is not approved', async () => {
    const testId = 'TC-111';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request_not_approved, status },
        global: {
          plugins: [router],
        },
      });

      const withdrawButton = wrapper.find('.btn-danger');
      expect(withdrawButton.exists()).toBe(false);

      // Ensure modal is not shown
      expect(wrapper.vm.showModal).toBe(false);

      await flushAll();

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('get_WFH_period method', async () => {
    const testId = 'TC-112';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request },
      });
      expect(wrapper.vm.get_WFH_period('FULL')).toBe('Full Day');
      expect(wrapper.vm.get_WFH_period('AM')).toBe('9am - 1pm');
      expect(wrapper.vm.get_WFH_period('PM')).toBe('2pm - 6pm');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('formatRequestDate method', async () => {
    const testId = 'TC-113';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request },
      });
      const formattedDate = wrapper.vm.formatRequestDate('2024-10-01');
      expect(formattedDate).toBe('October 1, 2024 (Tuesday)');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('notMoreThanTwoMonthsAgo method', async () => {
    const testId = 'TC-114';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: { requests: request },
      });
      const notMoreThanTwoMonths =
        wrapper.vm.notMoreThanTwoMonthsAgo('2024-10-01');
      expect(notMoreThanTwoMonths).toBe(true);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
