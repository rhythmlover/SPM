import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ManagerView from '../staff/ScheduleList.vue';
import { updateSheet } from '../../../updateGoogleSheet';

describe('ManagerView', () => {
  const request = {
    '2024-10-22': {
      requests: [
        {
          Request_ID: 1,
          Staff: {
            Staff_FName: 'John',
            Staff_LName: 'Doe',
            Position: 'Software Engineer',
          },
          Request_Period: 'AM',
          Status: 'Pending',
        },
      ],
    },
  };

  const emptyRequest = {
    '2024-10-22': {
      requests: [],
    },
  };

  it('Render correct table headings', async () => {
    const testId = 'TC-072';
    try {
      const wrapper = mount(ManagerView, {
        props: {
          wfhRequests: request,
        },
      });
      const headers = wrapper.findAll('th');
      expect(headers[0].text()).toBe('Name');
      expect(headers[1].text()).toBe('Position');
      expect(headers[2].text()).toBe('WFH Period');
      expect(headers[3].text()).toBe('Status');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Render correct number of WFH Requests', async () => {
    const testId = 'TC-073';
    try {
      const wrapper = mount(ManagerView, {
        props: {
          wfhRequests: request,
        },
      });
      const totalRequests = Object.values(request).reduce((acc, dateObj) => {
        return acc + dateObj.requests.length;
      }, 0);

      const requestRows = wrapper.findAll('tbody tr');
      expect(requestRows.length).toBe(totalRequests);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Display "No WFH requests for this day" if no requests for that day', async () => {
    const testId = 'TC-074';
    try {
      const wrapper = mount(ManagerView, {
        props: {
          wfhRequests: emptyRequest,
        },
      });

      const noRequestsMessage = wrapper.find('p');
      expect(noRequestsMessage.text()).toBe('No WFH requests for this day');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
