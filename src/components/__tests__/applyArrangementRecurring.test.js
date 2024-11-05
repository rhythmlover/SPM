import ApplyArrangementRecurring from '../ApplyArrangementRecurring.vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { updateSheet } from '../../../updateGoogleSheet';
import axios from 'axios';

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
                ['2024-10-03', 'AM'],
                ['2024-10-15', 'PM'],
                ['2024-11-16', 'FULL'],
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

describe('ApplyArrangementRecurring.vue', () => {
  beforeEach(() => {
    localStorage.setItem('staffID', '171015');
    localStorage.setItem('roleID', '2');
    localStorage.setItem('staffFName', 'Narong');
    localStorage.setItem('staffLName', 'Kaur');
    localStorage.setItem('deptID', '6');
    localStorage.setItem('reportingManager', '171018');
    vi.clearAllMocks();
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
    WFH_Day: '2',
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

  const createWrapper = async (data) => {
    const pushMock = vi.fn();
    const wrapper = mount(ApplyArrangementRecurring, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
        mocks: {
          $router: {
            push: pushMock,
          },
        },
      },
    });
    if (data) {
      await wrapper.setData(data);
    }
    return wrapper;
  };

  it('should apply arrangement successfully with a valid request', async () => {
    const testId = 'TC-064';
    const wrapper = await createWrapper(validRequest);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const modal = wrapper.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.find('.modal-title').text()).toBe('Success');
    expect(modal.find('.modal-body p').text()).toBe(
      'Request Submitted Successfully',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if a field is missing', async () => {
    const testId = 'TC-065';
    const wrapper = await createWrapper(invalidRequestEmptyField);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const modal = wrapper.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.find('.modal-title').text()).toBe('Error');
    expect(modal.find('.modal-body p').text()).toBe(
      'Please fill in all fields',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if the WFH date is out of valid range', async () => {
    const testId = 'TC-066';
    const wrapper = await createWrapper(invalidRequestOutRange);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'No valid dates found for the selected range and day of the week',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should display a success message upon successful application', async () => {
    const testId = 'TC-067';
    const wrapper = await createWrapper(validRequest);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const modal = wrapper.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.find('.modal-title').text()).toBe('Success');
    expect(modal.find('.modal-body p').text()).toBe(
      'Request Submitted Successfully',
    );
    expect(wrapper.vm.errorMessage).toBe('');
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

    const modal = wrapper.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.find('.modal-title').text()).toBe('Success');
    expect(modal.find('.modal-body p').text()).toBe(
      'Request Submitted Successfully',
    );
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
      'You have a clashing request for the following dates:\n2024-10-16',
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

    const modal = wrapper.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.find('.modal-title').text()).toBe('Error');
    expect(modal.find('.modal-body p').text()).toBe(
      'Please fill in all fields',
    );
    expect(axios.post).not.toHaveBeenCalled();
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

  it('should reset form fields after successful application', async () => {
    const testId = 'TC-139';
    const wrapper = await createWrapper(validRequest);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.WFH_Date_Start).toBe('');
    expect(wrapper.vm.WFH_Date_End).toBe('');
    expect(wrapper.vm.WFH_Day).toBe('');
    expect(wrapper.vm.Request_Period).toBe('');
    expect(wrapper.vm.Request_Reason).toBe('');
    expect(wrapper.vm.errorMessage).toBe('');
    const modal = wrapper.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.find('.modal-title').text()).toBe('Success');
    expect(modal.find('.modal-body p').text()).toBe(
      'Request Submitted Successfully',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should correctly set the date of request', async () => {
    const testId = 'TC-140';
    const wrapper = await createWrapper(validRequest);

    expect(wrapper.vm.Request_Date).toBe('2024-10-15');
    await updateSheet(testId, 'Passed');
  });

  it('should handle API failure in fetchReportingManagerID', async () => {
    const testId = 'TC-141';

    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error('API Error')),
    );

    const wrapper = mount(ApplyArrangementRecurring, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    await flushPromises();

    const modal = wrapper.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.find('.modal-title').text()).toBe('Error');
    expect(modal.find('.modal-body p').text()).toBe(
      'Failed to fetch reporting manager information',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should handle API failure in fetchExistingWFHDates', async () => {
    const testId = 'TC-142';

    axios.get.mockImplementation((url) => {
      if (url.includes('/employee/get-staff-reporting-manager')) {
        return Promise.resolve({
          data: { results: [{ Reporting_Manager: '171018' }] },
        });
      }
      if (url.includes('/employee/get-staff-name-by-id')) {
        return Promise.resolve({ data: { name: 'Ji Truong' } });
      }
      if (
        url.includes('/wfh-request/user/non-recurring-dates') ||
        url.includes('/wfh-request/user/recurring-dates')
      ) {
        return Promise.reject(new Error('API Error'));
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const wrapper = mount(ApplyArrangementRecurring, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const modal = wrapper.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.find('.modal-title').text()).toBe('Error');
    expect(modal.find('.modal-body p').text()).toBe(
      'Failed to fetch existing WFH dates',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should call resetForm when cancel is invoked', async () => {
    const testId = 'TC-143';
    const wrapper = await createWrapper(validRequest);

    // Assuming resetForm is refactored to reset fields directly
    await wrapper.vm.cancel();

    expect(wrapper.vm.WFH_Date_Start).toBe('');
    expect(wrapper.vm.WFH_Date_End).toBe('');
    expect(wrapper.vm.WFH_Day).toBe('');
    expect(wrapper.vm.Request_Period).toBe('');
    expect(wrapper.vm.Request_Reason).toBe('');
    expect(wrapper.vm.errorMessage).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should handle API error during apply request', async () => {
    const testId = 'TC-144';

    axios.get.mockReset();
    axios.post.mockReset();

    axios.get.mockImplementation((url) => {
      if (url.includes('/employee/get-staff-reporting-manager')) {
        return Promise.resolve({
          data: { results: [{ Reporting_Manager: '171018' }] },
        });
      }
      if (url.includes('/employee/get-staff-name-by-id')) {
        return Promise.resolve({ data: { name: 'Ji Truong' } });
      }
      if (
        url.includes('/wfh-request/user/non-recurring-dates') ||
        url.includes('/wfh-request/user/recurring-dates')
      ) {
        return Promise.resolve({
          data: { results: [], recurringDates: [] },
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    axios.post.mockImplementation(() => Promise.reject(new Error('API Error')));

    const wrapper = await createWrapper(validRequest);

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    const modal = wrapper.find('.modal-overlay');
    expect(modal.exists()).toBe(true);
    expect(modal.find('.modal-title').text()).toBe('Error');
    expect(modal.find('.modal-body p').text()).toBe(
      'Request Submission Failed',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should set Approver_Name after fetching reporting manager', async () => {
    const testId = 'TC-145';
    const wrapper = await createWrapper(validRequest);

    expect(wrapper.vm.Approver_Name).toBe('Ji Truong');
    await updateSheet(testId, 'Passed');
  });

  it('should navigate to staff-myschedule when cancel is invoked', async () => {
    const testId = 'TC-146';
    const pushMock = vi.fn();
    const wrapper = mount(ApplyArrangementRecurring, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
        mocks: {
          $router: {
            push: pushMock,
          },
        },
      },
    });

    await flushPromises();
    await wrapper.vm.cancel();

    expect(pushMock).toHaveBeenCalledWith('/staff-myschedule');
    await updateSheet(testId, 'Passed');
  });

  it('should call fetchReportingManagerID and fetchExistingWFHDates on mounted', async () => {
    const testId = 'TC-147';
    const fetchReportingManagerIDSpy = vi.spyOn(
      ApplyArrangementRecurring.methods,
      'fetchReportingManagerID',
    );
    const fetchExistingWFHDatesSpy = vi.spyOn(
      ApplyArrangementRecurring.methods,
      'fetchExistingWFHDates',
    );

    mount(ApplyArrangementRecurring, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });
    await flushPromises();

    expect(fetchReportingManagerIDSpy).toHaveBeenCalled();
    expect(fetchExistingWFHDatesSpy).toHaveBeenCalled();
    await updateSheet(testId, 'Passed');
  });

  it('should validate isWeekend computed property correctly', async () => {
    const testId = 'TC-148';
    const wrapper = mount(ApplyArrangementRecurring, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    expect(wrapper.vm.isWeekend('2024-12-07')).toBe(true);
    expect(wrapper.vm.isWeekend('2024-12-08')).toBe(true);
    expect(wrapper.vm.isWeekend('2024-12-09')).toBe(false);
    await updateSheet(testId, 'Passed');
  });
});
