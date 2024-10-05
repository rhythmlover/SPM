import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { updateSheet } from '../../../updateGoogleSheet';
import ScheduleList from '../staff/ScheduleList.vue';

describe('ScheduleList.vue', () => {
  // it('should set the default active link to "/incoming-requests"', async () => {
  //   const testId = 'TC-028';
  //   try {
  //     const wrapper = mount(ScheduleList);
  //     expect(wrapper.vm.activeLink).toBe('/incoming-requests');
  //     await updateSheet(testId, 'Passed');
  //   } catch (error) {
  //     await updateSheet(testId, 'Failed');
  //     throw error;
  //   }
  // });
  const wrapper = mount(ScheduleList);

  it('renders the current month in an h2 element', async () => {
    const testId = 'TC-028';
    // Mock Date object to control the current date
    const mockDate = new Date(2024, 9, 5); // October (months are 0-indexed)
    vi.useFakeTimers(); // Use fake timers to control Date
    vi.setSystemTime(mockDate);

    try {
      expect(wrapper.find('h2').text()).toBe('October 2024');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }

    vi.useRealTimers(); // Restore real timers after the test
  });
});
