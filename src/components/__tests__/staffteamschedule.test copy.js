import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import StaffTeamSchedule from '@/components/staff/StaffTeamSchedule.vue';

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
  const mockStaffID = '140003';
  const mockAPIRoute = 'http://localhost:3000';

  const mockResponse = {
    data: {
      employeeRequests: [
        {
          "employee": {
              "Staff_ID": 140002,
              "Staff_FName": "Susan",
              "Staff_LName": "Goh",
              "position": "Account Manager"
          },
          "wfhRequests": [
              {
                  "Request_ID": 103,
                  "Staff_ID": 140002,
                  "Request_Date": "2024-10-14T16:00:00.000Z",
                  "Request_Period": "FULL",
                  "Request_Reason": "Family emergency",
                  "Status": "Pending",
                  "Approver_ID": null,
                  "Comments": null,
                  "Decision_Date": null,
                  "WFH_Date": "2024-10-24T16:00:00.000Z",
                  "Recurring_Request_ID": null
              }
          ]
        },
        {
            "employee": {
                "Staff_ID": 140003,
                "Staff_FName": "Janice",
                "Staff_LName": "Chan",
                "position": "Account Manager"
            },
            "wfhRequests": [
                {
                    "Request_ID": 104,
                    "Staff_ID": 140003,
                    "Request_Date": "2024-10-14T16:00:00.000Z",
                    "Request_Period": "AM",
                    "Request_Reason": "Doctor appointment",
                    "Status": "Approved",
                    "Approver_ID": null,
                    "Comments": null,
                    "Decision_Date": null,
                    "WFH_Date": "2024-10-24T16:00:00.000Z",
                    "Recurring_Request_ID": null
                }
            ]
        },
        {
            "employee": {
                "Staff_ID": 140004,
                "Staff_FName": "Mary",
                "Staff_LName": "Teo",
                "position": "Account Manager"
            },
            "wfhRequests": [
                {
                    "Request_ID": 105,
                    "Staff_ID": 140004,
                    "Request_Date": "2024-10-15T16:00:00.000Z",
                    "Request_Period": "PM",
                    "Request_Reason": "Child appointment",
                    "Status": "Pending",
                    "Approver_ID": null,
                    "Comments": null,
                    "Decision_Date": null,
                    "WFH_Date": "2024-10-21T16:00:00.000Z",
                    "Recurring_Request_ID": null
                }
            ]
        },
        {
            "employee": {
                "Staff_ID": 140015,
                "Staff_FName": "Oliva",
                "Staff_LName": "Lim",
                "position": "Account Manager"
            },
            "wfhRequests": []
        },
        {
            "employee": {
                "Staff_ID": 140025,
                "Staff_FName": "Emma",
                "Staff_LName": "Heng",
                "position": "Account Manager"
            },
            "wfhRequests": []
        },
        {
            "employee": {
                "Staff_ID": 140036,
                "Staff_FName": "Charlotte",
                "Staff_LName": "Wong",
                "position": "Account Manager"
            },
            "wfhRequests": []
        },
        {
            "employee": {
                "Staff_ID": 140078,
                "Staff_FName": "Amelia",
                "Staff_LName": "Ong",
                "position": "Account Manager"
            },
            "wfhRequests": []
        },
        {
            "employee": {
                "Staff_ID": 140102,
                "Staff_FName": "Eva",
                "Staff_LName": "Yong",
                "position": "Account Manager"
            },
            "wfhRequests": []
        },
        {
            "employee": {
                "Staff_ID": 140108,
                "Staff_FName": "Liam",
                "Staff_LName": "The",
                "position": "Account Manager"
            },
            "wfhRequests": []
        },
        {
            "employee": {
                "Staff_ID": 140115,
                "Staff_FName": "Noah",
                "Staff_LName": "Ng",
                "position": "Account Manager"
            },
            "wfhRequests": [
                {
                    "Request_ID": 106,
                    "Staff_ID": 140115,
                    "Request_Date": "2024-10-12T16:00:00.000Z",
                    "Request_Period": "FULL",
                    "Request_Reason": "Appointment",
                    "Status": "Pending",
                    "Approver_ID": null,
                    "Comments": null,
                    "Decision_Date": null,
                    "WFH_Date": "2024-10-18T16:00:00.000Z",
                    "Recurring_Request_ID": null
                }
            ]
        },
        {
            "employee": {
                "Staff_ID": 140525,
                "Staff_FName": "Oliver",
                "Staff_LName": "Tan",
                "position": "Account Manager"
            },
            "wfhRequests": []
        },
        {
            "employee": {
                "Staff_ID": 140736,
                "Staff_FName": "William",
                "Staff_LName": "Fu",
                "position": "Account Manager"
            },
            "wfhRequests": []
        },
        {
            "employee": {
                "Staff_ID": 140878,
                "Staff_FName": "James",
                "Staff_LName": "Tong",
                "position": "Account Manager"
            },
            "wfhRequests": []
        }
      ]
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue(mockResponse);
    require('vue').inject.mockReturnValueOnce(mockStaffID).mockReturnValueOnce(mockAPIRoute);
    
    wrapper = mount(StaffTeamSchedule);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the component', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('fetches WFH requests on mount', async () => {
    await wrapper.vm.$nextTick();
    expect(axios.get).toHaveBeenCalledWith(
      `${mockAPIRoute}/teamlist/byReportingManager`,
      { params: { Staff_ID: mockStaffID } }
    );
  });

  it('displays the current period', async () => {
    await wrapper.vm.$nextTick();
    const currentPeriod = wrapper.find('h2').text();
    expect(currentPeriod).toMatch(/^\w+ \d{4}$/);
  });

  it('displays WFH requests', async () => {
    await wrapper.vm.$nextTick();
    const listItems = wrapper.findAll('.list-group-item');
    expect(listItems.length).toBeGreaterThan(0);
  });

  it('filters WFH requests by teammate', async () => {
    await wrapper.vm.$nextTick();
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    await checkboxes[1].setValue(false);
    await wrapper.vm.$nextTick();
    const listItems = wrapper.findAll('.list-group-item');
    expect(listItems.length).toBeLessThan(mockResponse.data.employeeRequests.length);
  });

  it('toggles between month and week view', async () => {
    const select = wrapper.find('select');
    await select.setValue(false);
    expect(wrapper.vm.isMonthView).toBe(false);
    const periodText = wrapper.find('h2').text();
    expect(periodText).toMatch(/^\w+ \d{1,2} - \w+ \d{1,2}, \d{4}$/);
  });

  it('navigates to previous period', async () => {
    const initialDate = new Date(wrapper.vm.viewingDate);
    await wrapper.find('button:first-child').trigger('click');
    expect(wrapper.vm.viewingDate.getMonth()).toBe((initialDate.getMonth() - 1 + 12) % 12);
  });

  it('navigates to next period', async () => {
    const initialDate = new Date(wrapper.vm.viewingDate);
    await wrapper.find('button:last-child').trigger('click');
    expect(wrapper.vm.viewingDate.getMonth()).toBe((initialDate.getMonth() + 1) % 12);
  });

  it('highlights user requests', async () => {
    await wrapper.vm.$nextTick();
    const userRequest = wrapper.find('.user-request');
    expect(userRequest.exists()).toBe(true);
    expect(userRequest.attributes('style')).toContain('border: 2px solid');
  });

  it('displays error message when API request fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    await wrapper.vm.fetchSchedule();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.alert-danger').exists()).toBe(true);
    expect(wrapper.find('.alert-danger').text()).toContain('API Error');
  });

  it('toggles all teammates', async () => {
    await wrapper.vm.$nextTick();
    const selectAllCheckbox = wrapper.find('input[type="checkbox"]');
    await selectAllCheckbox.setValue(false);
    expect(wrapper.vm.selectedTeammates).toHaveLength(0);
    await selectAllCheckbox.setValue(true);
    expect(wrapper.vm.selectedTeammates).toHaveLength(wrapper.vm.teammates.length);
  });
});