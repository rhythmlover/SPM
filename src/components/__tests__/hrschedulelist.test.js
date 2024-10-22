import { describe, it, expect, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import HrScheduleList from '../hr/HrScheduleList.vue';
import { formatDateFromStr, getRequestStatusPillColor } from '@/utils/utils';
import { updateSheet } from '../../../updateGoogleSheet';

vi.mock('@/utils/utils', () => ({
  formatDateFromStr: vi.fn(),
  getRequestStatusPillColor: vi.fn(),
}));

describe('HrScheduleList', () => {
  const wfhRequestsMock = {
    '2023-10-22': {
      requests: [
        {
          Request_ID: '1',
          Staff: {
            Staff_FName: 'John',
            Staff_LName: 'Doe',
            Position: 'Engineer',
          },
          Request_Period: '09:00 - 18:00',
          Status: 'Approved',
        },
      ],
      wfh_count: 1,
      total_count: 1,
    },
    '2023-10-23': { requests: [], wfh_count: 0, total_count: 2 },
  };

  it('renders correctly with WFH requests', async () => {
    const testId = 'TC-075';
    try {
      formatDateFromStr.mockReturnValue('22 Oct 2023');
      getRequestStatusPillColor.mockReturnValue('success');

      const wrapper = mount(HrScheduleList, {
        props: { wfhRequests: wfhRequestsMock },
      });

      // Check if it renders the correct number of rows
      const rows = wrapper.findAll('tr');
      expect(rows).toHaveLength(2); // 1 for header, 1 for a request

      // Check if the request details are displayed correctly
      expect(wrapper.text()).toContain('John Doe');
      expect(wrapper.text()).toContain('Engineer');
      expect(wrapper.text()).toContain('09:00 - 18:00');
      expect(wrapper.text()).toContain('Approved');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('displays "No WFH requests for this day" when no requests are available', async () => {
    const testId = 'TC-076';
    try {
      const wrapper = mount(HrScheduleList, {
        props: {
          wfhRequests: {
            '2023-10-23': { requests: [], wfh_count: 0, total_count: 2 },
          },
        },
      });

      // Check for the "No WFH requests" message
      expect(wrapper.text()).toContain('No WFH requests for this day');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('calls utility functions correctly', async () => {
    const testId = 'TC-077';
    try {
      mount(HrScheduleList, {
        props: { wfhRequests: wfhRequestsMock },
      });

      // Check if formatDateFromStr is called with the correct argument
      expect(formatDateFromStr).toHaveBeenCalledWith('2023-10-22');

      // Check if getRequestStatusPillColor is called with the correct status
      expect(getRequestStatusPillColor).toHaveBeenCalledWith('Approved');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('renders correctly with default/empty wfhRequests', async () => {
    const testId = 'TC-078';
    try {
      const wrapper = mount(HrScheduleList, {
        props: { wfhRequests: {} }, // Empty object
      });

      // Check if it renders without errors
      expect(wrapper.exists()).toBe(true);
      // Since it's empty, no table should be rendered
      expect(wrapper.find('table').exists()).toBe(false);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('handles null wfhRequests prop gracefully', async () => {
    const testId = 'TC-079';
    try {
      const wrapper = mount(HrScheduleList, {
        props: { wfhRequests: null }, // null input
      });

      // Ensure it renders without errors
      expect(wrapper.exists()).toBe(true);
      // Since it's null, no table should be rendered
      expect(wrapper.find('table').exists()).toBe(false);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
