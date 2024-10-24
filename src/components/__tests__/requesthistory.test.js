import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RequestHistory from '../RequestHistory.vue';
import { updateSheet } from '../../../updateGoogleSheet';

describe('RequestHistory', () => {
  const request = [
    {
      Approver: {
        Staff_FName: 'John',
        Staff_LName: 'Doe',
      },
      Request_Reason: 'Sick Leave',
      WFH_Date: '2024-10-01T16:00:00.000Z',
      Request_Date: '2024-09-01T16:00:00.000Z',
      Decision_Date: '2024-09-5T16:00:00.000Z',
      Request_Period: 'AM',
      Status: 'Approved',
      Comment: 'Get well soon!',
    },
  ];

  const emptyRequest = [];

  it('Render correct table headings', async () => {
    const testId = 'TC-084';
    try {
      const wrapper = mount(RequestHistory, {
        props: {
          requests: request,
        },
      });
      const headers = wrapper.findAll('th');
      expect(headers[0].text()).toBe('Approver');
      expect(headers[1].text()).toBe('Reason for Request');
      expect(headers[2].text()).toBe('WFH Date');
      expect(headers[3].text()).toBe('Requested On');
      expect(headers[4].text()).toBe('Status');
      expect(headers[5].text()).toBe('Comments');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Render correct number of WFH Requests', async () => {
    const testId = 'TC-085';
    try {
      const wrapper = mount(RequestHistory, {
        props: {
          requests: request,
        },
      });
      const totalRequests = request.length;
      expect(wrapper.findAll('tbody tr').length).toBe(totalRequests);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Renders empty table when no requests are provided', async () => {
    const testId = 'TC-086';
    try {
      const wrapper = mount(RequestHistory, {
        props: {
          requests: emptyRequest,
        },
      });
      const rows = wrapper.findAll('p');
      expect(rows.length).toBe(1);
      expect(wrapper.text()).toContain('No WFH requests available');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Formats request dates correctly', async () => {
    const testId = 'TC-087';
    try {
      const wrapper = mount(RequestHistory, {
        props: {
          requests: request,
        },
      });
      const requestDate = wrapper.find('tbody tr td:nth-child(4)').text();
      expect(requestDate).toBe('September 1, 2024 (Sunday)');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Displays correct badge for request status', async () => {
    const testId = 'TC-088';
    try {
      const wrapper = mount(RequestHistory, {
        props: {
          requests: request,
        },
      });
      const badge = wrapper.find('.badge');
      expect(badge.text()).toBe('Approved');
      expect(badge.classes()).toContain('text-bg-success');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Handles invalid request data gracefully', async () => {
    const testId = 'TC-089';
    const invalidRequest = [
      {
        Approver: null,
        Request_Reason: '',
        WFH_Date: null,
        Request_Date: null,
        Status: null,
        Comments: '',
      },
    ];
    try {
      const wrapper = mount(RequestHistory, {
        props: {
          requests: invalidRequest,
        },
      });
      expect(wrapper.find('tbody tr').exists()).toBe(true);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
