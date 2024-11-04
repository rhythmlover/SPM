import { mount } from '@vue/test-utils';
import RequestTable from '@/components/RequestTable.vue';
import StatusButton from '../StatusButton.vue';
import { describe, it, expect } from 'vitest';
import { updateSheet } from '../../../updateGoogleSheet';

describe('RequestTable.vue', () => {
  const request = [
    {
      Request_ID: 1,
      Staff_FName: 'John',
      Staff_LName: 'Doe',
      Request_Reason: 'Personal',
      Request_Period: 'Full Day',
      WFH_Date: '2023-09-01',
      Request_Date: '2023-08-25',
      Comments: 'Not applicable',
      Status: 'Pending',
    },
  ];

  const request_approved = [
    {
      Request_ID: 1,
      Staff_FName: 'Jane',
      Staff_LName: 'Smith',
      Request_Reason: 'Medical',
      Request_Period: 'Full Day',
      WFH_Date: '2023-09-05',
      Request_Date: '2023-08-28',
      Comments: 'Not applicable',
      Status: 'Approved',
    },
  ];

  const withdrawal_request = [
    {
      Request_ID: 1,
      Staff_FName: 'Jane',
      Staff_LName: 'Smith',
      Request_Reason: 'Studies',
      Request_Period: 'Full Day',
      WFH_Date: '2023-09-05',
      Request_Date: '2023-08-28',
      Comments: 'Yes, approved',
      Status: 'Withdrawal Pending',
    },
  ];

  it('should display staff full name', async () => {
    const testId = 'TC-007';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request, status: 'pending' },
      });
      const nameText = wrapper.find('td.col-2').text();
      expect(nameText).toContain('John Doe');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should display the correct reason', async () => {
    const testId = 'TC-008';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request, status: 'pending' },
      });
      const reasonText = wrapper.findAll('td.col-2').at(1).text();
      expect(reasonText).toBe('Personal');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should cancel rejection process when cancel button is clicked', async () => {
    const testId = 'TC-009';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request, status: 'pending' },
      });

      await wrapper.find('.reject-btn').trigger('click');

      let textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBe(true);

      await wrapper.find('.reject-cancel-btn').trigger('click');

      textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBe(false);

      expect(wrapper.vm.rejectionReason[1]).toBe('');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should emit updateRequestStatus with "Approved" when accept button is clicked', async () => {
    const testId = 'TC-010';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request, status: 'pending' },
        components: { StatusButton },
      });
      await wrapper.find('.accept-btn').trigger('click');
      expect(wrapper.emitted().updateRequestStatus[0]).toEqual([1, 'Approved']);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should emit rejectRequest with request ID and rejection reason when reject is clicked and submitted', async () => {
    const testId = 'TC-011';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request, status: 'pending' },
        components: { StatusButton },
      });

      await wrapper.find('.reject-btn').trigger('click');
      await wrapper.find('textarea').setValue(request.Request_Reason);
      await wrapper.find('.reject-submit-btn').trigger('click');

      expect(wrapper.emitted().updateRequestStatus[0]).toEqual([
        1,
        'Rejected',
        `${request.Request_Reason}`,
      ]);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should emit withdrawRequest with request ID and withdrawal reason when withdraw is clicked and submitted', async () => {
    const testId = 'TC-012';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request_approved, status: 'accepted' },
        components: { StatusButton },
      });
      await wrapper.find('.withdraw-btn').trigger('click');
      await wrapper.find('textarea').setValue(request_approved.Request_Reason);
      await wrapper.find('.withdraw-submit-btn').trigger('click');
      expect(wrapper.emitted().updateRequestStatus[0]).toEqual([
        1,
        'Withdrawn',
        `${request_approved.Request_Reason}`,
      ]);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should display the request comments if status is rejected', async () => {
    const testId = 'TC-013';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request, status: 'rejected' },
      });
      const commentText = wrapper.findAll('td.col-2').at(5).text();
      expect(commentText).toBe('Not applicable');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should not display action buttons if status is rejected', async () => {
    const testId = 'TC-014';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request, status: 'rejected' },
      });
      const buttons = wrapper.findAllComponents(StatusButton);
      expect(buttons.length).toBe(0);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should not submit rejection if no reason is provided', async () => {
    const testId = 'TC-020';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request, status: 'pending' },
        components: { StatusButton },
      });
      await wrapper.find('.reject-btn').trigger('click');
      await wrapper.find('.reject-submit-btn').trigger('click');
      expect(wrapper.emitted().rejectRequest).toBeFalsy();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should not emit an update with an invalid status', async () => {
    const testId = 'TC-021';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: request, status: 'pending' },
        components: { StatusButton },
      });
      wrapper.vm.updateStatus('InvalidStatus');
      expect(wrapper.emitted().updateRequestStatus).toBeFalsy();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should render the table headers correctly', async () => {
    const testId = 'TC-015';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests: request,
          status: 'pending',
        },
      });
      const headers = wrapper.findAll('th');
      expect(headers[0].text()).toBe('Name');
      expect(headers[1].text()).toBe('Reason for Request');
      expect(headers[2].text()).toBe('WFH Date');
      expect(headers[3].text()).toBe('Requested On');
      expect(headers[4].text()).toBe('Request Type');
      expect(headers[5].text()).toBe('Actions');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should render the correct number of RequestTable components', async () => {
    const testId = 'TC-016';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests: request,
          status: 'pending',
        },
        components: { StatusButton },
      });

      // Only count request rows within the Non-Recurring Requests section
      const nonRecurringRows = wrapper.findAll('tbody tr').filter((row) => {
        return (
          !row.classes().includes('section-header') &&
          row.find('td')?.text()?.includes(request[0].Staff_FName)
        );
      });

      expect(nonRecurringRows.length).toBe(request.length);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('updateRequestStatus is emitted when a row action is triggered', async () => {
    const testId = 'TC-017';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests: request,
          status: 'pending',
        },
      });
      await wrapper.find('.accept-btn').trigger('click');
      expect(wrapper.emitted().updateRequestStatus).toBeTruthy();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Actions column is not displayed when status is rejected', async () => {
    const testId = 'TC-018';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests: request,
          status: 'rejected',
        },
      });
      const headers = wrapper.findAll('th');
      const actionsColumn = headers.filter(
        (header) => header.text() === 'Actions',
      );
      expect(actionsColumn.length).toBe(0);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Reason column is displayed when status is rejected', async () => {
    const testId = 'TC-019';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests: request,
          status: 'rejected',
        },
      });
      const headers = wrapper.findAll('th');
      const commentsColumn = headers.filter(
        (header) => header.text() === 'Comments',
      );
      expect(commentsColumn.length).toBe(1);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('for withdrawal requests, should emit updateRequestStatus with "Approved" when accept button is clicked', async () => {
    const testId = 'TC-043';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: withdrawal_request, status: 'pending' },
        components: { StatusButton },
      });
      await wrapper.find('.accept-withdrawal-btn').trigger('click');
      expect(wrapper.emitted().updateRequestStatus[0]).toEqual([
        1,
        'Withdrawn',
      ]);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('for withdrawal requests, should emit rejectRequest with request ID and rejection reason when reject is clicked and submitted', async () => {
    const testId = 'TC-044';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: withdrawal_request, status: 'pending' },
        components: { StatusButton },
      });

      await wrapper.find('.reject-btn').trigger('click');
      await wrapper
        .find('textarea')
        .setValue(withdrawal_request.Request_Reason);
      await wrapper.find('.reject-submit-btn').trigger('click');

      expect(wrapper.emitted().updateRequestStatus[0]).toEqual([
        1,
        'Approved',
        `${withdrawal_request.Request_Reason}`,
      ]);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('for withdrawal requests, should not submit rejection if no reason is provided', async () => {
    const testId = 'TC-045';
    try {
      const wrapper = mount(RequestTable, {
        props: { requests: withdrawal_request, status: 'pending' },
        components: { StatusButton },
      });
      await wrapper.find('.reject-btn').trigger('click');
      await wrapper.find('.reject-submit-btn').trigger('click');
      expect(wrapper.emitted().rejectRequest).toBeFalsy();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
