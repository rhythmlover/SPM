import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ScheduleList from '../staff/ScheduleList.vue';
import { updateSheet } from '../../../updateGoogleSheet';

describe('ScheduleList.vue', () => {
  const mockWFHRequests = {
    '2024-10-01': {
      requests: [
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
    },
    '2024-10-02': {
      requests: [
        {
          Request_ID: 2,
          Staff: {
            Staff_FName: 'Jane',
            Staff_LName: 'Doe',
            Position: 'Manager',
          },
          Request_Period: '10 AM - 4 PM',
          Status: 'pending',
        },
      ],
    },
  };

  it('renders correctly with given props', async () => {
    const testId = 'TC-028';
    try {
      const wrapper = mount(ScheduleList, {
        props: {
          wfhRequests: mockWFHRequests,
        },
      });

      // Check if the correct dates are rendered
      const dateHeaders = wrapper.findAll('h4.mb-0'); // Adjust selector based on your template
      expect(dateHeaders.length).toBe(2);
      expect(dateHeaders[0].text()).toContain('October 1'); // Check first date
      expect(dateHeaders[1].text()).toContain('October 2'); // Check second date

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
