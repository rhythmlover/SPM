import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import StaffTeamSchedule from '../staff/StaffTeamSchedule.vue';
import { updateSheet } from '../../../updateGoogleSheet';

describe('StaffTeamSchedule.vue', () => {
  const mockWFHRequests = {
    employeeRequests: [
      {
        employee: {
          Staff_ID: 140002,
          Staff_FName: "Susan",
          Staff_LName: "Goh",
          position: "Account Manager"
        },
        wfhRequests: [
          {
            Request_ID: 103,
            Staff_ID: 140002,
            Request_Date: "2024-10-14T16:00:00.000Z",
            Request_Period: "FULL",
            Request_Reason: "Family emergency",
            Status: "Pending",
            Approver_ID: null,
            Comments: null,
            Decision_Date: null,
            WFH_Date: "2024-10-24T16:00:00.000Z",
            Recurring_Request_ID: null
          }
        ]
      },
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
      },
      {
        employee: {
          Staff_ID: 140004,
          Staff_FName: "Mary",
          Staff_LName: "Teo",
          position: "Account Manager"
        },
        wfhRequests: [
          {
            Request_ID: 105,
            Staff_ID: 140004,
            Request_Date: "2024-10-15T16:00:00.000Z",
            Request_Period: "PM",
            Request_Reason: "Child appointment",
            Status: "Pending",
            Approver_ID: null,
            Comments: null,
            Decision_Date: null,
            WFH_Date: "2024-10-21T16:00:00.000Z",
            Recurring_Request_ID: null
          }
        ]
      }
    ]
  };

  it('filters teammates correctly', async () => {
    const testId = 'TC-030';
    try {
      const wrapper = mount(StaffTeamSchedule, {
        props: {
          wfhRequests: mockWFHRequests,
        },
      });

      // Verify initial state
      let requestItems = wrapper.findAll('.list-group-item');
      expect(requestItems.length).toBe(0); // All 3 requests should be visible initially

      // Open the teammate filter dropdown
      const dropdown = wrapper.find('.dropdown-toggle');
      await dropdown.trigger('click');

      // Get all checkboxes
      const checkboxes = wrapper.findAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(1);

      // Uncheck "Select All"
      await checkboxes[0].setValue(false);
      await wrapper.vm.$nextTick();

      // Verify all teammates are unchecked
      requestItems = wrapper.findAll('.list-group-item');
      expect(requestItems.length).toBe(0);

      // Check Susan Goh
      await checkboxes[1].setValue(true);
      await wrapper.vm.$nextTick();

      requestItems = wrapper.findAll('.list-group-item');
      expect(requestItems.length).toBe(1);
      expect(requestItems[0].text()).toContain('Susan Goh');

      // Check Janice Chan
      await checkboxes[2].setValue(true);
      await wrapper.vm.$nextTick();

      requestItems = wrapper.findAll('.list-group-item');
      expect(requestItems.length).toBe(2);
      expect(requestItems[0].text()).toContain('Susan Goh');
      expect(requestItems[1].text()).toContain('Janice Chan');

      // Uncheck Susan Goh
      await checkboxes[1].setValue(false);
      await wrapper.vm.$nextTick();

      requestItems = wrapper.findAll('.list-group-item');
      expect(requestItems.length).toBe(1);
      expect(requestItems[0].text()).toContain('Janice Chan');

      // Check "Select All"
      await checkboxes[0].setValue(true);
      await wrapper.vm.$nextTick();

      requestItems = wrapper.findAll('.list-group-item');
      expect(requestItems.length).toBe(3);

      // Verify "Select All" gets unchecked when not all teammates are selected
      await checkboxes[1].setValue(false);
      await wrapper.vm.$nextTick();

      expect(checkboxes[0].element.checked).toBe(false);

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
  
  it('maintains filter state across period changes', async () => {
    const testId = 'TC-031';
    try {
      const wrapper = mount(StaffTeamSchedule, {
        props: {
          wfhRequests: mockWFHRequests,
        },
      });

      // Open the teammate filter dropdown
      const dropdown = wrapper.find('.dropdown-toggle');
      await dropdown.trigger('click');

      // Get all checkboxes
      const checkboxes = wrapper.findAll('input[type="checkbox"]');

      // Uncheck all except Janice Chan
      await checkboxes[0].setValue(false);
      await checkboxes[2].setValue(true);
      await wrapper.vm.$nextTick();

      let requestItems = wrapper.findAll('.list-group-item');
      expect(requestItems.length).toBe(1);
      expect(requestItems[0].text()).toContain('Janice Chan');

      // Navigate to next period
      const nextButton = wrapper.findAll('button').filter(w => w.text().includes('Next'))[0];
      await nextButton.trigger('click');
      await wrapper.vm.$nextTick();

      // Check if filter state is maintained
      requestItems = wrapper.findAll('.list-group-item');
      expect(requestItems.length).toBe(0); // Assuming no requests in the next period

      // Navigate back
      const prevButton = wrapper.findAll('button').filter(w => w.text().includes('Previous'))[0];
      await prevButton.trigger('click');
      await wrapper.vm.$nextTick();

      requestItems = wrapper.findAll('.list-group-item');
      expect(requestItems.length).toBe(1);
      expect(requestItems[0].text()).toContain('Janice Chan');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
