import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RequestHistory from '../RequestHistory.vue';
import { updateSheet } from '../../../updateGoogleSheet';
import { get_WFH_period, moreThanTwoMonths } from '../RequestHistory.vue';

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

  it('Displays correct period for AM request', async () => {
    const testId = 'TC-100';
    try {
      const amRequest = [
        {
          ...request[0],
          Request_Period: 'AM',
        },
      ];
      const wrapper = mount(RequestHistory, {
        props: {
          requests: amRequest,
        },
      });
      const period = wrapper.find('tbody tr td:nth-child(3)').text();
      expect(period).toContain('9am - 1pm');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Displays correct period for PM request', async () => {
    const testId = 'TC-101';
    try {
      const pmRequest = [
        {
          ...request[0],
          Request_Period: 'PM',
        },
      ];
      const wrapper = mount(RequestHistory, {
        props: {
          requests: pmRequest,
        },
      });
      const period = wrapper.find('tbody tr td:nth-child(3)').text();
      expect(period).toContain('2pm - 6pm');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Displays correct period for FULL request', async () => {
    const testId = 'TC-102';
    try {
      const fullRequest = [
        {
          ...request[0],
          Request_Period: 'FULL',
        },
      ];
      const wrapper = mount(RequestHistory, {
        props: {
          requests: fullRequest,
        },
      });
      const period = wrapper.find('tbody tr td:nth-child(3)').text();
      expect(period).toContain('Full Day');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Displays correct badge for Pending status', async () => {
    const testId = 'TC-103';
    try {
      const pendingRequest = [
        {
          ...request[0],
          Status: 'Pending',
        },
      ];
      const wrapper = mount(RequestHistory, {
        props: {
          requests: pendingRequest,
        },
      });
      const badge = wrapper.find('.badge');
      expect(badge.text()).toBe('Pending');
      expect(badge.classes()).toContain('text-bg-info');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Displays correct badge for Withdrawn status', async () => {
    const testId = 'TC-104';
    try {
      const withdrawnRequest = [
        {
          ...request[0],
          Status: 'Withdrawn',
        },
      ];
      const wrapper = mount(RequestHistory, {
        props: {
          requests: withdrawnRequest,
        },
      });
      const badge = wrapper.find('.badge');
      expect(badge.text()).toBe('Withdrawn');
      expect(badge.classes()).toContain('text-bg-secondary');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Displays correct badge for Withdrawal Pending status', async () => {
    const testId = 'TC-105';
    try {
      const withdrawalPendingRequest = [
        {
          ...request[0],
          Status: 'Withdrawal Pending',
        },
      ];
      const wrapper = mount(RequestHistory, {
        props: {
          requests: withdrawalPendingRequest,
        },
      });
      const badge = wrapper.find('.badge');
      expect(badge.text()).toBe('Withdrawn');
      expect(badge.classes()).toContain('text-bg-light');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Displays correct badge for Rejected status', async () => {
    const testId = 'TC-106';
    try {
      const rejectedRequest = [
        {
          ...request[0],
          Status: 'Rejected',
        },
      ];
      const wrapper = mount(RequestHistory, {
        props: {
          requests: rejectedRequest,
        },
      });
      const badge = wrapper.find('.badge');
      expect(badge.text()).toBe('Rejected');
      expect(badge.classes()).toContain('text-bg-danger');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('moreThanTwoMonths function works correctly', async () => {
    const testId = 'TC-107';
    try {
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const result = moreThanTwoMonths(twoMonthsAgo.toISOString());
      expect(result).toBe(true);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('get_WFH_period function works correctly', async () => {
    const testId = 'TC-108';
    try {
      expect(get_WFH_period('FULL')).toBe('Full Day');
      expect(get_WFH_period('AM')).toBe('9am - 1pm');
      expect(get_WFH_period('PM')).toBe('2pm - 6pm');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
