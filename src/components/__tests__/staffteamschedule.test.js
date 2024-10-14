import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import StaffTeamSchedule from '@/components/staff/StaffTeamSchedule.vue';
import * as vue from 'vue';

vi.mock('axios');
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    inject: vi.fn(),
  };
});

describe('StaffTeamSchedule.vue', () => {
  let wrapper;
  const mockStaffID = vue.ref('140003');
  const mockAPIRoute = 'http://localhost:3000';

  const mockResponse = {
    data: {
      employeeRequests: [
        {
          employee: {
            Staff_ID: 140003,
            Staff_FName: "Janice",
            Staff_LName: "Chan",
            position: "Account Manager"
          },
          wfhRequests: [
            {
              Request_ID: 104,
              Staff_ID: 140003,
              Request_Date: "2024-10-14T16:00:00.000Z",
              Request_Period: "AM",
              Request_Reason: "Doctor appointment",
              Status: "Approved",
              Approver_ID: null,
              Comments: null,
              Decision_Date: null,
              WFH_Date: "2024-10-24T16:00:00.000Z",
              Recurring_Request_ID: null
            }
          ]
        }
      ]
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the inject function to return our mock values
    vue.inject.mockImplementation((key) => {
      if (key === 'staffID') return mockStaffID;
      if (key === 'API_ROUTE') return mockAPIRoute;
      return undefined;
    });
    
    axios.get.mockResolvedValue(mockResponse);

    wrapper = mount(StaffTeamSchedule, {
      global: {
        stubs: ['BRow', 'BCol', 'BFormSelect', 'BDropdown', 'BDropdownForm', 'BFormCheckbox', 'BButton', 'BIcon', 'BCard', 'BListGroup', 'BListGroupItem', 'BBadge'],
        mocks: {
          $bvModal: {
            msgBoxConfirm: vi.fn()
          }
        }
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('fetches WFH requests on mount and processes the data correctly', async () => {
    await vue.nextTick();

    // Log the staffID
    console.log('Staff ID used in the component:', wrapper.vm.staffID);

    // Check if the API was called with the correct parameters
    expect(axios.get).toHaveBeenCalledWith(
      `${mockAPIRoute}/teamlist/byReportingManager`,
      { params: { Staff_ID: mockStaffID.value } }
    );

    // Check if the API was called only once
    expect(axios.get).toHaveBeenCalledTimes(1);

    // Log the processed data
    console.log('Processed teammates:', wrapper.vm.teammates);
    console.log('Processed dates in period:', wrapper.vm.datesInPeriod);

    // Add more detailed logging
    console.log('All component data:', wrapper.vm.$data);

    // Wait for any asynchronous operations to complete
    await vue.nextTick();

    // Check if the data was processed correctly
    expect(wrapper.vm.teammates).toBeDefined();
    expect(wrapper.vm.teammates).toHaveLength(1);
    expect(wrapper.vm.teammates[0]).toEqual({
      Staff_ID: "140003",
      Staff_FName: "Janice",
      Staff_LName: "Chan"
    });

    // Check if the WFH requests were processed correctly
    const date = new Date("2024-10-24T16:00:00.000Z").toLocaleDateString('en-CA');
    expect(wrapper.vm.datesInPeriod).toBeDefined();
    expect(wrapper.vm.datesInPeriod[date]).toBeDefined();
    expect(wrapper.vm.datesInPeriod[date].requests).toBeDefined();
    expect(wrapper.vm.datesInPeriod[date].requests).toHaveLength(1);
    expect(wrapper.vm.datesInPeriod[date].requests[0]).toMatchObject({
      Request_ID: 104,
      Staff_ID: "140003",
      Request_Period: "AM",
      Request_Reason: "Doctor appointment",
      Status: "Approved"
    });
    
  });
});