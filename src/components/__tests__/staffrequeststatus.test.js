import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import StaffRequestStatus from '../../views/staff/StaffRequestStatus.vue';
import { updateSheet } from '../../../updateGoogleSheet';

vi.mock('../../../updateGoogleSheet', () => ({
  updateSheet: vi.fn(),
}));

describe('StaffRequestStatus.vue', () => {
  const mockWFHRequests = [
    {
      Staff_ID: 17,
      Request_ID: 1,
      Request_Date: '2024-09-25',
      WFH_Date: '2024-10-01',
      Request_Period: 'PM',
      Request_Reason: 'Personal',
      Status: 'Pending',
    },
  ];

  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(false); // Mocks 'Cancel' action
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore original functionality after each test
  });

  it('User Cancels Deletion of Pending Request', async () => {
    const testId = 'TC-022';
    try {
      const wrapper = mount(StaffRequestStatus, {
        props: {
          wfhRequests: mockWFHRequests,
        },
      });

      // Ensure that the correct WFH request is displayed
      const requestRow = wrapper.find('td'); // Adjusted to match the row in the table
      expect(requestRow.exists()).toBe(true);
      expect(requestRow.text()).toContain(17);
      expect(requestRow.text()).toContain(1);
      expect(requestRow.text()).toContain('2024-09-25');
      expect(requestRow.text()).toContain('2024-10-01');
      expect(requestRow.text()).toContain('PM');
      expect(requestRow.text()).toContain('Personal');
      expect(requestRow.text()).toContain('Pending');

      // Simulate clicking the delete button
      const deleteButton = wrapper.find('.btn-warning'); // Match the delete button for 'Cancel' action
      await deleteButton.trigger('click');

      // Simulate canceling the deletion
      expect(window.confirm).toBeCalled(); // Assert the confirm dialog was shown
      expect(window.confirm).toHaveReturnedWith(false); // User clicked "Cancel"

      // Ensure the WFH request is still present (i.e., not deleted)
      const updatedRequestRow = wrapper.find('td'); // Same selector for the row
      expect(updatedRequestRow.exists()).toBe(true);
      expect(updatedRequestRow.text()).toContain('Pending');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
