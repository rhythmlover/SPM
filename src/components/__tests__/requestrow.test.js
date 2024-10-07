import { mount } from '@vue/test-utils';
import RequestRow from '@/components/RequestRow.vue';
import StatusButton from '@/components/StatusButton.vue';
import { describe, it, expect } from 'vitest';
import { updateSheet } from '../../../updateGoogleSheet';

describe('RequestRow.vue', () => {
  const request = {
    Staff_FName: 'John',
    Staff_LName: 'Doe',
    Request_Reason: 'Personal',
    WFH_Date: '2023-09-01',
    Request_Date: '2023-08-25',
    Request_ID: 1,
    Comments: 'Not applicable',
    Rejection_Withdraw_Reason: 'Invalid Request',
  };

  it('should display staff full name', async () => {
    const testId = 'TC-007';
    try {
      const wrapper = mount(RequestRow, {
        props: { request, status: 'pending' },
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
      const wrapper = mount(RequestRow, {
        props: { request, status: 'pending' },
      });
      const reasonText = wrapper.findAll('td.col-4').at(0).text();
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
      const wrapper = mount(RequestRow, {
        props: { request, status: 'pending' },
        components: { StatusButton },
      });

      await wrapper.find('.reject-btn').trigger('click');

      let textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBe(true);

      await wrapper.find('.reject-cancel-btn').trigger('click');

      textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBe(false);

      expect(wrapper.vm.rejectionReason).toBe('');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should emit updateRequestStatus with "Approved" when accept button is clicked', async () => {
    const testId = 'TC-010';
    try {
      const wrapper = mount(RequestRow, {
        props: { request, status: 'pending' },
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
      const wrapper = mount(RequestRow, {
        props: { request, status: 'pending' },
        components: { StatusButton },
      });

      await wrapper.find('.reject-btn').trigger('click');
      await wrapper
        .find('textarea')
        .setValue(request.Rejection_Withdraw_Reason);
      await wrapper.find('.reject-submit-btn').trigger('click');

      expect(wrapper.emitted().rejectRequest[0]).toEqual([
        1,
        request.Rejection_Withdraw_Reason,
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
      const wrapper = mount(RequestRow, {
        props: { request, status: 'accepted' },
        components: { StatusButton },
      });
      await wrapper.find('.withdraw-btn').trigger('click');
      await wrapper
        .find('textarea')
        .setValue(request.Rejection_Withdraw_Reason);
      await wrapper.find('.withdraw-submit-btn').trigger('click');
      expect(wrapper.emitted().withdrawRequest[0]).toEqual([
        1,
        request.Rejection_Withdraw_Reason,
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
      const wrapper = mount(RequestRow, {
        props: { request, status: 'rejected' },
      });
      const commentText = wrapper.findAll('td.col-2').at(3).text();
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
      const wrapper = mount(RequestRow, {
        props: { request, status: 'rejected' },
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
      const wrapper = mount(RequestRow, {
        props: { request, status: 'pending' },
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
      const wrapper = mount(RequestRow, {
        props: { request, status: 'pending' },
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
});
