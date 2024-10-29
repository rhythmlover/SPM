import ApplyArrangement from '../ApplyArrangement.vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { updateSheet } from '../../../updateGoogleSheet';

const flushPromises = () => new Promise(nextTick);

vi.mock('axios', () => {
  return {
    __esModule: true,
    default: {
      post: vi.fn(() => Promise.resolve({ data: { success: true } })),
      get: vi.fn((url) => {
        if (url.includes('/employee/login')) {
          return Promise.resolve({
            data: {
              Staff_ID: '171015',
              Staff_FName: 'Narong',
              Staff_LName: 'Kaur',
              Dept_ID: '6',
              Role_ID: '2',
              Reporting_Manager: '171018',
            },
          });
        }
        if (url.includes('/employee/get-staff-reporting-manager')) {
          return Promise.resolve({
            data: { results: [{ Reporting_Manager: '171018' }] },
          });
        }
        if (url.includes('/employee/get-staff-name-by-id')) {
          return Promise.resolve({ data: { name: 'Ji Truong' } });
        }
        if (url.includes('/wfh-request/user/non-recurring-dates')) {
          return Promise.resolve({
            data: {
              results: [['2024-09-03', 'AM']],
            },
          });
        }
        if (url.includes('/wfh-request/user/recurring-dates')) {
          return Promise.resolve({
            data: { recurringDates: ['2024-09-16', 'FULL'] },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      }),
    },
  };
});

describe('ApplyArrangement.vue', () => {
  const setupLocalStorage = () => {
    const staffID = '171015';
    localStorage.setItem('staffID', staffID);
    localStorage.setItem('roleID', '2');
    localStorage.setItem('staffFName', 'Narong');
    localStorage.setItem('staffLName', 'Kaur');
    localStorage.setItem('deptID', '6');
    localStorage.setItem('reportingManager', '171018');
  };

  beforeEach(() => {
    setupLocalStorage();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const validRequest = {
    Staff_ID: '171015',
    Request_Date: '2024-10-15',
    Request_Period: 'AM',
    Request_Reason: 'Personal',
    WFH_Date: '2024-10-15',
    Status: 'Pending',
    Approver_ID: '171018',
    Approver_Name: 'Ji Truong',
  };

  const invalidRequestEmptyField = {
    ...validRequest,
    Request_Reason: '',
  };

  const invalidRequestWeekend = {
    ...validRequest,
    WFH_Date: '2024-09-01',
  };

  const invalidRequestOutRange = {
    ...validRequest,
    WFH_Date: '2022-03-01',
  };

  const existingRequest = {
    Staff_ID: '171015',
    WFH_Date: '2024-10-15',
  };

  it('should apply arrangement successfully with a valid request', async () => {
    const testId = 'TC-046';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(validRequest);
    await flushPromises();
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.successMessage).toBe('Request Submitted Successfully');
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if a field is missing', async () => {
    const testId = 'TC-047';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(invalidRequestEmptyField);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Please fill in all fields');
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if WFH date is on a weekend', async () => {
    const testId = 'TC-048';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(invalidRequestWeekend);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'This date already has a request or is a weekend',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if the WFH date is out of valid range', async () => {
    const testId = 'TC-049';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(invalidRequestOutRange);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'Request date is outside the allowed range',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should display a success message upon successful application', async () => {
    const testId = 'TC-050';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(validRequest);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('.alert-success').exists()).toBe(true);
    await updateSheet(testId, 'Passed');
  });

  it('should reset form fields after successful application', async () => {
    const testId = 'TC-051';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(validRequest);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.Request_Reason).toBe('');
    expect(wrapper.vm.Request_Period).toBe('');
    expect(wrapper.vm.WFH_Date).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if the user tries to submit for the same day', async () => {
    const testId = 'TC-052';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(existingRequest);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('.alert-danger').exists()).toBe(true);
    await updateSheet(testId, 'Passed');
  });

  it('should correctly set the date of request', async () => {
    const testId = 'TC-053';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(validRequest);
    expect(wrapper.vm.Request_Date).toBe(validRequest.Request_Date);
    await updateSheet(testId, 'Passed');
  });

  it('should allow a non-clashing half-day request for the same date', async () => {
    const testId = 'TC-091';
    const wrapper = mount(ApplyArrangement, {
      props: { API_ROUTE: 'http://localhost:3000' },
    });

    await wrapper.setData({
      ...validRequest,
      Request_Date: '2024-09-03',
      Request_Period: 'PM',
    });
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.successMessage).toBe('Request Submitted Successfully');
    await updateSheet(testId, 'Passed');
  });

  it('should require all fields populated for submission', async () => {
    const testId = 'TC-092';
    const wrapper = mount(ApplyArrangement, {
      props: { API_ROUTE: 'http://localhost:3000' },
    });

    await wrapper.setData({ ...validRequest, Request_Reason: '' });
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Please fill in all fields');
    await updateSheet(testId, 'Passed');
  });
});
