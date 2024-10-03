import { mount } from '@vue/test-utils';
import RequestTable from '@/components/RequestTable.vue';
import RequestRow from '@/components/RequestRow.vue';
import { describe, it, expect } from 'vitest';
import { updateSheet } from '../../../updateGoogleSheet';

describe('RequestTable.vue', () => {
  const requests = [
    {
      Request_ID: 1,
      Staff_FName: 'John',
      Staff_LName: 'Doe',
      Reason: 'Personal',
      WFH_Date: '2023-09-01',
      Request_Date: '2023-08-25T10:00:00',
      Comments: 'Not applicable',
    },
    {
      Request_ID: 2,
      Staff_FName: 'Jane',
      Staff_LName: 'Smith',
      Reason: 'Medical',
      WFH_Date: '2023-09-05',
      Request_Date: '2023-08-28T12:00:00',
      Comments: 'Not applicable',
    },
  ];

  it('should render the table headers correctly', async () => {
    const testId = 'TC-015';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests,
          status: 'pending',
        },
      });
      const headers = wrapper.findAll('th');
      expect(headers[0].text()).toBe('Name');
      expect(headers[1].text()).toBe('Reason for Request');
      expect(headers[2].text()).toBe('WFH Date');
      expect(headers[3].text()).toBe('Requested On');
      expect(headers[4].text()).toBe('Actions');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should render the correct number of RequestRow components', async () => {
    const testId = 'TC-016';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests,
          status: 'pending',
        },
      });
      const requestRows = wrapper.findAllComponents(RequestRow);
      expect(requestRows.length).toBe(requests.length);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should emit updateRequestStatus when a row action is triggered', async () => {
    const testId = 'TC-017';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests,
          status: 'pending',
        },
      });
      wrapper
        .findComponent(RequestRow)
        .vm.$emit('updateRequestStatus', 1, 'Approved');
      expect(wrapper.emitted().updateRequestStatus).toBeTruthy();
      expect(wrapper.emitted().updateRequestStatus[0]).toEqual([1, 'Approved']);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should not display the "Actions" column if status is "rejected"', async () => {
    const testId = 'TC-018';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests,
          status: 'rejected',
        },
      });
      const headers = wrapper.findAll('th');
      const actionHeader = headers.find(
        (header) => header.text() === 'Actions',
      );
      expect(actionHeader).toBeUndefined();
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should display the "Reason" column when status is "rejected"', async () => {
    const testId = 'TC-019';
    try {
      const wrapper = mount(RequestTable, {
        props: {
          requests,
          status: 'rejected',
        },
      });
      const headers = wrapper.findAll('th');
      expect(headers[4].text()).toBe('Reason');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
