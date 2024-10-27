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
            data: {
              results: [
                ['2024-09-03', 'AM'],
                ['2024-10-15', 'PM'],
                ['2024-09-16', 'FULL'],
              ],
            },
          });
        }
        if (url.includes('/wfh-request/user/recurring-dates')) {
          return Promise.resolve({
            data: { recurringDates: [['2024-10-16', 'FULL']] },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      }),
    },
  };
});

const ERROR_MESSAGES = {
  MISSING_FIELDS: 'Please fill in all fields',
  INVALID_DATES:
    'No valid dates found for the selected range and day of the week',
  CLASHING_REQUEST: (dates) =>
    `You have a clashing request for the following dates: ${dates}`,
};

const createWrapper = async (data) => {
  const wrapper = mount(ApplyArrangementRecurring, {
    props: { API_ROUTE: 'http://localhost:3000' },
  });
  if (data) {
    await wrapper.setData(data);
    await flushPromises();
  }
  return wrapper;
};

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
    Request_Period: 'AM',
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

  const createRequest = (overrides) => ({
    Staff_ID: '171015',
    Request_Date: '2024-10-15',
    WFH_Date_Start: '2024-10-16',
    WFH_Date_End: '2024-10-16',
    WFH_Day: '3',
    Request_Period: 'AM',
    Request_Reason: 'Personal',
    ...overrides,
  });

  it('should apply arrangement successfully with a valid request', async () => {
    const testId = 'TC-064';
    const wrapper = await createWrapper(validRequest);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.successMessage).toBe('Request Submitted Successfully');
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if a field is missing', async () => {
    const testId = 'TC-065';
    const wrapper = await createWrapper(invalidRequestEmptyField);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(ERROR_MESSAGES.MISSING_FIELDS);
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if the WFH date is out of valid range', async () => {
    const testId = 'TC-066';
    const wrapper = await createWrapper(invalidRequestOutRange);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(ERROR_MESSAGES.INVALID_DATES);
    await updateSheet(testId, 'Passed');
  });

  it('should display a success message upon successful application', async () => {
    const testId = 'TC-067';
    const wrapper = await createWrapper(validRequest);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.find('.alert-success').exists()).toBe(true);
    await updateSheet(testId, 'Passed');
  });

  it('should correctly retrieve the applied dates in accordance to date range', async () => {
    const testId = 'TC-068';
    const wrapper = await createWrapper(validRequest);

    expect(wrapper.find('.alert-info').text()).toBe(
      'Applied Dates:2024-12-022024-12-092024-12-162024-12-232024-12-30',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should allow submitting a half-day request if a non-clashing half-day request exists', async () => {
    const testId = 'TC-069';
    const wrapper = await createWrapper();

    await wrapper.setData({
      Staff_ID: '171015',
      Request_Date: '2024-10-15',
      WFH_Date_Start: '2024-10-15',
      WFH_Date_End: '2024-10-15',
      WFH_Day: '2',
      Request_Period: 'AM',
      Request_Reason: 'Personal',
    });
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.successMessage).toBe('Request Submitted Successfully');
    await updateSheet(testId, 'Passed');
  });

  it('should not allow submitting a half-day request if a full-day request exists for the same day', async () => {
    const testId = 'TC-093';
    const wrapper = await createWrapper();

    await wrapper.setData({
      existingWFHDates: [['2024-10-16', 'FULL']],
    });
    await flushPromises();

    const halfDayRequest = createRequest({
      WFH_Date_Start: '2024-10-16',
      WFH_Date_End: '2024-10-16',
      WFH_Day: '3',
      Request_Period: 'AM',
    });

    await wrapper.setData(halfDayRequest);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      ERROR_MESSAGES.CLASHING_REQUEST('2024-10-16'),
    );
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if a field is missing', async () => {
    const testId = 'TC-094';
    const wrapper = await createWrapper({
      ...validRequest,
      Request_Reason: '',
    });

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(ERROR_MESSAGES.MISSING_FIELDS);
    await updateSheet(testId, 'Passed');
  });

  it('should correctly retrieve the applied dates in accordance with the date range', async () => {
    const testId = 'TC-095';
    const wrapper = await createWrapper(validRequest);

    expect(wrapper.find('.alert-info').text()).toBe(
      'Applied Dates:2024-12-022024-12-092024-12-162024-12-232024-12-30',
    );
    await updateSheet(testId, 'Passed');
  });

});
