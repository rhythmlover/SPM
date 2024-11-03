import ApplyArrangement from '../ApplyArrangement.vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { updateSheet } from '../../../updateGoogleSheet';
import axios from 'axios';
import router from '@/router';

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
              results: [['2024-10-03', 'AM']],
            },
          });
        }
        if (url.includes('/wfh-request/user/recurring-dates')) {
          return Promise.resolve({
            data: { recurringDates: ['2024-10-16', 'FULL'] },
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
    vi.clearAllMocks();
  });

  const validRequest = {
    Staff_ID: '171015',
    Request_Date: new Date().toISOString().split('T')[0],
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
    WFH_Date: '2024-12-07',
  };

  const invalidRequestOutRange = {
    ...validRequest,
    WFH_Date: '2022-03-01',
  };

  const existingRequest = {
    ...validRequest,
    WFH_Date: '2024-10-03',
    Request_Period: 'AM',
  };

  const mountComponent = () => {
    return mount(ApplyArrangement, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
        mocks: {
          $router: router,
        },
      },
    });
  };

  it('should apply arrangement successfully with a valid request', async () => {
    const testId = 'TC-046';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await flushPromises();
    await wrapper.setData(validRequest);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.successMessage).toBe('Request Submitted Successfully');
    expect(wrapper.vm.errorMessage).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if a field is missing', async () => {
    const testId = 'TC-047';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await flushPromises();
    await wrapper.setData(invalidRequestEmptyField);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Please fill in all fields');
    expect(wrapper.vm.successMessage).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if WFH date is on a weekend', async () => {
    const testId = 'TC-048';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await flushPromises();
    await wrapper.setData(invalidRequestWeekend);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'This date already has a request or is a weekend',
    );
    expect(wrapper.vm.successMessage).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message if the WFH date is out of valid range', async () => {
    const testId = 'TC-049';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await flushPromises();
    await wrapper.setData(invalidRequestOutRange);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'Request date is outside the allowed range',
    );
    expect(wrapper.vm.successMessage).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should display a success message upon successful application', async () => {
    const testId = 'TC-050';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await flushPromises();
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

    await flushPromises();
    await wrapper.setData(validRequest);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.Request_Reason).toBe('');
    expect(wrapper.vm.Request_Period).toBe('');
    expect(wrapper.vm.WFH_Date).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should display an error message for duplicate request', async () => {
    const testId = 'TC-052';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await flushPromises();
    await wrapper.setData(existingRequest);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'You have a clashing request for the chosen date and period',
    );
    expect(wrapper.vm.successMessage).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should correctly set the date of request', async () => {
    const testId = 'TC-053';
    const wrapper = mount(ApplyArrangement, {
      props: {
        API_ROUTE: 'http://localhost:3000',
      },
    });

    await flushPromises();
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
      Request_Date: '2024-10-03',
      Request_Period: 'PM',
    });

    await flushPromises();
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

    await flushPromises();
    await wrapper.setData({ ...validRequest, Request_Reason: '' });
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Please fill in all fields');
    await updateSheet(testId, 'Passed');
  });

  it('should handle API failure in fetchReportingManagerID', async () => {
    const testId = 'TC-127';
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error('API Error')),
    );
    const wrapper = mount(ApplyArrangement, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'Failed to fetch reporting manager information',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should handle API failure in fetchExistingWFHDates', async () => {
    const testId = 'TC-128';
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error('API Error')),
    );
    axios.get.mockImplementationOnce(() =>
      Promise.reject(new Error('API Error')),
    );
    const wrapper = mount(ApplyArrangement, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Failed to fetch existing WFH dates');
    await updateSheet(testId, 'Passed');
  });

  it('should validate isWeekend computed property correctly', async () => {
    const testId = 'TC-129';
    const wrapper = mount(ApplyArrangement, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    const saturday = '2024-12-07';
    const sunday = '2024-12-08';
    const weekday = '2024-12-06';

    expect(wrapper.vm.isWeekend(saturday)).toBe(true);
    expect(wrapper.vm.isWeekend(sunday)).toBe(true);
    expect(wrapper.vm.isWeekend(weekday)).toBe(false);
    await updateSheet(testId, 'Passed');
  });

  it('should validate isDateDisabled computed property correctly', async () => {
    const testId = 'TC-130';
    const wrapper = mount(ApplyArrangement, {
      data() {
        return {
          existingWFHDates: [['2024-10-03', 'AM']],
        };
      },
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    const weekendDate = '2024-12-07';
    const availableDate = '2024-12-06';

    expect(wrapper.vm.isDateDisabled(weekendDate)).toBe(true);
    expect(wrapper.vm.isDateDisabled(availableDate)).toBe(false);
    await updateSheet(testId, 'Passed');
  });

  it('should call resetForm when cancel is invoked', async () => {
    const testId = 'TC-131';
    const wrapper = mount(ApplyArrangement, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
        mocks: {
          $router: {
            push: vi.fn(),
          },
        },
      },
    });

    wrapper.vm.WFH_Date = '2024-10-15';
    wrapper.vm.Request_Period = 'AM';
    wrapper.vm.Request_Reason = 'Personal';

    await wrapper.vm.cancel();

    expect(wrapper.vm.WFH_Date).toBe('');
    expect(wrapper.vm.Request_Period).toBe('');
    expect(wrapper.vm.Request_Reason).toBe('');
    expect(wrapper.vm.errorMessage).toBe('');
    expect(wrapper.vm.successMessage).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should handle API error during apply request', async () => {
    const testId = 'TC-132';
    axios.post.mockImplementationOnce(() =>
      Promise.reject({
        response: { data: { message: 'Application Submission Failed' } },
      }),
    );
    const wrapper = mount(ApplyArrangement, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    await flushPromises();
    await wrapper.setData(validRequest);
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe('Application Submission Failed');
    expect(wrapper.vm.successMessage).toBe('');
    await updateSheet(testId, 'Passed');
  });

  it('should not submit if the date is outside minDate and maxDate', async () => {
    const testId = 'TC-133';
    const wrapper = mount(ApplyArrangement, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    const outOfRangeDate = '2022-01-01'; // Assuming this is outside the allowed range

    await wrapper.setData({
      ...validRequest,
      WFH_Date: outOfRangeDate,
    });
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'Request date is outside the allowed range',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should display clashing date error when there is a date and period conflict', async () => {
    const testId = 'TC-134';
    const wrapper = mount(ApplyArrangement, {
      data() {
        return {
          existingWFHDates: [['2024-10-03', 'FULL']],
          Staff_ID: '171015',
        };
      },
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    await wrapper.setData({
      WFH_Date: '2024-10-03',
      Request_Period: 'AM',
      Request_Reason: 'Personal',
    });
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.vm.errorMessage).toBe(
      'You have a clashing request for the chosen date and period',
    );
    await updateSheet(testId, 'Passed');
  });

  it('should set Approver_Name after fetching reporting manager', async () => {
    const testId = 'TC-135';
    const wrapper = mount(ApplyArrangement, {
      global: {
        provide: {
          API_ROUTE: 'http://localhost:3000',
        },
      },
    });

    await flushPromises();

    expect(wrapper.vm.Approver_Name).toBe('Ji Truong');
    await updateSheet(testId, 'Passed');
  });

  it('should navigate to staff-myschedule when cancel is invoked', async () => {
    const testId = 'TC-136';
    const pushMock = vi.fn();
    const wrapper = mount(ApplyArrangement, {
      global: {
        mocks: {
          $router: {
            push: pushMock,
          },
        },
      },
    });

    wrapper.vm.cancel();
    expect(pushMock).toHaveBeenCalledWith('/staff-myschedule');
    await updateSheet(testId, 'Passed');
  });

  it('should call fetch methods on mounted', async () => {
    const testId = 'TC-137';
    const fetchReportingManagerIDSpy = vi.spyOn(
      ApplyArrangement.methods,
      'fetchReportingManagerID',
    );
    const fetchExistingWFHDatesSpy = vi.spyOn(
      ApplyArrangement.methods,
      'fetchExistingWFHDates',
    );

    mount(ApplyArrangement, {
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

  it('calls fetchReportingManagerID and fetchExistingWFHDates on mounted', async () => {
    const testId = 'TC-138';
    const fetchReportingManagerIDSpy = vi.spyOn(
      ApplyArrangement.methods,
      'fetchReportingManagerID',
    );
    const fetchExistingWFHDatesSpy = vi.spyOn(
      ApplyArrangement.methods,
      'fetchExistingWFHDates',
    );

    axios.get.mockImplementation((url) => {
      if (url.includes('/employee/get-staff-reporting-manager')) {
        return Promise.resolve({
          data: { results: [{ Reporting_Manager: '171018' }] },
        });
      }
      if (url.includes('/employee/get-staff-name-by-id')) {
        return Promise.resolve({ data: { name: 'Ji Truong' } });
      }
      if (url.includes('/wfh-request/user/non-recurring-dates')) {
        return Promise.resolve({ data: { results: [['2024-10-03', 'AM']] } });
      }
      if (url.includes('/wfh-request/user/recurring-dates')) {
        return Promise.resolve({ data: { recurringDates: [] } });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    mountComponent();
    await flushPromises();

    expect(fetchReportingManagerIDSpy).toHaveBeenCalled();
    expect(fetchExistingWFHDatesSpy).toHaveBeenCalled();
    await updateSheet(testId, 'Passed');
  });
});
