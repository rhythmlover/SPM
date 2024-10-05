import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateSheet } from '../../../updateGoogleSheet';
import ScheduleList from '../staff/ScheduleList.vue';

const waitForCondition = async (
  conditionFn,
  timeout = 5000,
  interval = 100,
) => {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkCondition = () => {
      if (conditionFn()) {
        resolve();
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error('Timed out waiting for condition'));
      } else {
        setTimeout(checkCondition, interval);
      }
    };

    checkCondition();
  });
};

describe('ScheduleList.vue', () => {
  const mockWFHRequests = {
    '2024-10-01': [
      {
        Request_ID: 1,
        Staff: {
          Staff_FName: 'John',
          Staff_LName: 'Doe',
          Position: 'Developer',
        },
        Request_Period: '9 AM - 5 PM',
        Status: 'approved',
      },
    ],
    '2024-10-02': [
      {
        Request_ID: 2,
        Staff: { Staff_FName: 'Jane', Staff_LName: 'Doe', Position: 'Manager' },
        Request_Period: '10 AM - 4 PM',
        Status: 'pending',
      },
    ],
  };

  beforeEach(() => {
    // Set a fixed date for testing
    const fixedDate = new Date('2024-10-05T12:00:00Z');
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    // Reset the mock date
    vi.useRealTimers();
  });

  it('renders correctly with given props', async () => {
    const testId = 'TC-028';
    try {
      const wrapper = mount(ScheduleList, {
        props: {
          wfhRequests: mockWFHRequests,
        },
      });

      // Wait until the spinner disappears (loading completes)
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // Check if the correct dates are rendered
      const dateHeaders = wrapper.findAll('h4.mb-0'); // Adjust selector based on your template
      expect(dateHeaders.length).toBe(31);
      expect(dateHeaders[0].text()).toContain('October 1'); // Check first date
      expect(dateHeaders[1].text()).toContain('October 2'); // Check second date

      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('handles period change forward', async () => {
    const testId = 'TC-029';
    try {
      const wrapper = mount(ScheduleList, {
        props: {
          wfhRequests: {},
        },
      });

      // Wait until the spinner disappears (loading completes)
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // Find next period buton
      const buttons = wrapper.findAll('button');
      const nextButton = buttons.find((button) => button.text() === 'Next');
      expect(nextButton.exists()).toBe(true);

      // Trigger click event on "Next" button
      await nextButton.trigger('click');

      // Wait for the next tick
      await wrapper.vm.$nextTick();

      // Check if the current period has changed
      expect(wrapper.find('h2').text()).toContain('November 2024');

      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('handles period change backwards', async () => {
    const testId = 'TC-030';

    try {
      const wrapper = mount(ScheduleList, {
        props: {
          wfhRequests: {},
        },
      });

      // Wait until the spinner disappears (loading completes)
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // Find previous period buton
      const buttons = wrapper.findAll('button');
      const nextButton = buttons.find((button) => button.text() === 'Previous');
      expect(nextButton.exists()).toBe(true);

      // Trigger click event on "Next" button
      await nextButton.trigger('click');

      // Wait for the next tick
      await wrapper.vm.$nextTick();

      // Check if the current period has changed
      expect(wrapper.find('h2').text()).toContain('September 2024');

      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('unable to shift to previous period if at min range', async () => {
    const testId = 'TC-031';

    try {
      const wrapper = mount(ScheduleList, {
        props: {
          wfhRequests: {},
        },
      });

      // Wait until the spinner disappears (loading completes)
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // // Mock the ableToShiftPeriod method to return [false, null]
      // const ableToShiftPeriodMock = vi
      //   .spyOn(wrapper.vm, 'ableToShiftPeriod')
      //   .mockReturnValue([false, null]);

      // Click the button
      let buttons = wrapper.findAll('button');
      let nextButton = buttons.find((button) => button.text() === 'Previous');
      await nextButton.trigger('click');
      // Wait for the DOM to update
      await wrapper.vm.$nextTick();
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // Click the button
      buttons = wrapper.findAll('button');
      nextButton = buttons.find((button) => button.text() === 'Previous');
      await nextButton.trigger('click');
      // Wait for the DOM to update
      await wrapper.vm.$nextTick();
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // Check if the period has been updated
      expect(wrapper.find('h2').text()).toContain('August 2024');

      // Expect button to be disabled
      buttons = wrapper.findAll('button');
      nextButton = buttons.find((button) => button.text() === 'Previous');
      expect(nextButton.attributes('disabled')).toBeDefined();

      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('unable to shift to next period if at max range', async () => {
    const testId = 'TC-032';

    try {
      const wrapper = mount(ScheduleList, {
        props: {
          wfhRequests: {},
        },
      });

      // Wait until the spinner disappears (loading completes)
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // // Mock the ableToShiftPeriod method to return [false, null]
      // const ableToShiftPeriodMock = vi
      //   .spyOn(wrapper.vm, 'ableToShiftPeriod')
      //   .mockReturnValue([false, null]);

      // Click the button
      let buttons = wrapper.findAll('button');
      let nextButton = buttons.find((button) => button.text() === 'Next');
      await nextButton.trigger('click');
      // Wait for the DOM to update
      await wrapper.vm.$nextTick();
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // Click the button
      buttons = wrapper.findAll('button');
      nextButton = buttons.find((button) => button.text() === 'Next');
      await nextButton.trigger('click');
      // Wait for the DOM to update
      await wrapper.vm.$nextTick();
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // Click the button
      buttons = wrapper.findAll('button');
      nextButton = buttons.find((button) => button.text() === 'Next');
      await nextButton.trigger('click');
      // Wait for the DOM to update
      await wrapper.vm.$nextTick();
      await waitForCondition(
        () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
      );

      // Check if the period has been updated
      expect(wrapper.find('h2').text()).toContain('January 2025');

      // Expect button to be disabled
      buttons = wrapper.findAll('button');
      nextButton = buttons.find((button) => button.text() === 'Next');
      expect(nextButton.attributes('disabled')).toBeDefined();

      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      // Reset the mock date
      vi.useRealTimers();
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  // it('displays error message if scheduleListError is set', async () => {
  //   const wrapper = mount(ScheduleList, {
  //     props: {
  //       wfhRequests: {},
  //     },
  //   });

  //   // Wait until the spinner disappears (loading completes)
  //   await waitForCondition(
  //     () => !wrapper.findComponent({ name: 'BSpinner' }).exists(),
  //   );

  //   // Manually set the error
  //   await wrapper.setData({ scheduleListError: 'An error occurred' });
  //   await wrapper.vm.$nextTick();

  //   // Check if the error message is displayed
  //   expect(wrapper.text()).toContain('An error occurred');
  // });
});
