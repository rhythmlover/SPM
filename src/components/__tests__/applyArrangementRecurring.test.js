import ApplyArrangementRecurring from '../ApplyArrangementRecurring.vue';
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
            data: { results: ['2024-09-03'] },
          });
        }
        if (url.includes('/wfh-request/user/recurring-dates')) {
          return Promise.resolve({
            data: { recurringDates: ['2024-09-16'] },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      }),
    },
  };
});

describe('ApplyArrangementRecurring.vue', () => {
  beforeEach(() => {
    const staffID = '171015';
    localStorage.setItem('staffID', staffID);
    localStorage.setItem('roleID', '2');
    localStorage.setItem('staffFName', 'Narong');
    localStorage.setItem('staffLName', 'Kaur');
    localStorage.setItem('deptID', '6');
    localStorage.setItem('reportingManager', '171018');
  });

  afterEach(() => {
    localStorage.clear();
  });

  const validRequest = {
    Staff_ID: '171015',
    Request_Date: '2024-10-15',
    WFH_Date_Start: '2024-12-01',
    WFH_Date_End: '2024-12-30',
    WFH_Day: '1',
    WFH_Period: 'AM',
    Request_Reason: 'Personal',
    Status: 'Pending',
    Approver_ID: '171018',
    Approver_Name: 'Ji Truong',
  };

  const invalidRequestEmptyField = {
    ...validRequest,
    Request_Reason: '',
  };

  const invalidRequestOutRange = {
    ...validRequest,
    WFH_Date_Start: '2022-03-01',
    WFH_Date_End: '2022-03-30',
  };

  const existingRequest = {
    Staff_ID: '171015',
    WFH_Date_Start: '2024-09-16',
    WFH_Date_End: '2024-09-30',
    WFH_Day: '1',
  };

  it('should apply arrangement successfully with a valid request', async () => {
    const testId = 'TC-064';
    const wrapper = mount(ApplyArrangementRecurring, {
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
    const testId = 'TC-065';
    const wrapper = mount(ApplyArrangementRecurring, {
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

  it('should display an error message if the WFH date is out of valid range', async () => {
    const testId = 'TC-066';
    const wrapper = mount(ApplyArrangementRecurring, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(invalidRequestOutRange);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'No valid dates found for the selected range and day of the week',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should display a success message upon successful application', async () => {
    const testId = 'TC-067';
    const wrapper = mount(ApplyArrangementRecurring, {
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

  it('should display an error message if the user tries to submit for the same day', async () => {
    const testId = 'TC-068';
    const wrapper = mount(ApplyArrangementRecurring, {
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

  it('should correctly retrieve the applied dates in accordance to date range', async () => {
    const testId = 'TC-069';
    const wrapper = mount(ApplyArrangementRecurring, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await wrapper.setData(validRequest);
    expect(wrapper.find('.alert-info').text()).toBe(
      'Applied Dates:2024-12-022024-12-092024-12-162024-12-232024-12-30',
    );
    await updateSheet(testId, 'Passed');
  });
});
