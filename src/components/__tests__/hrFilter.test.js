import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import HrFilter from '../../views/hr/HrViewSchedule.vue';
import { nextTick } from 'vue';
import { updateSheet } from '../../../updateGoogleSheet';
import { formatDateFromStr } from '@/utils/utils';

vi.mock('@/utils/utils', () => ({
    formatDateFromStr: vi.fn(),
  }));

describe('HrFilter', () => {
  let wrapper;

  // Mock data for WFH requests
  const wfhRequestsMock = {
    '2023-10-22': {
      requests: [
        {
          Request_ID: '1',
          Staff: {
            Staff_FName: 'John',
            Staff_LName: 'Doe',
            Position: 'Engineer',
            Department: { Dept_Name: 'Engineering' },
          },
          Request_Period: 'FULL',
          Status: 'Approved',
        },
      ],
      wfh_count: 1,
      total_count: 1,
    },
    '2023-10-23': { requests: [], wfh_count: 0, total_count: 2 },
  };

  beforeEach(() => {
    wrapper = mount(HrFilter, {
      props: { WFHRequests: wfhRequestsMock },
      data() {
        return {
          departmentView: 'Engineering',  // Set initial department filter value here
          periodView: 'FULL',              // Set initial period filter value here
          myDates: {},                     // Initialize myDates here
        };
      },
    });
  });

  it('should display WFH requests filtered by department and period', async () => {
    const testId = 'TC-090';

    try {

        mount(HrFilter, {
            props: { wfhRequests: wfhRequestsMock },
          });

        const formatDateSpy = vi.spyOn({ formatDateFromStr }, 'formatDateFromStr');

        // Map requests to dates and apply filter
        wrapper.vm.myDates = { ...wfhRequestsMock };  
        await wrapper.vm.filterRequests();          
        await nextTick();
    
        expect(formatDateSpy).toHaveBeenCalledWith('2023-10-22');
    
        const filteredRequests = wrapper.vm.myDates['2023-10-22']?.requests || [];
        
        expect(filteredRequests.length).toBe(1);
        expect(filteredRequests[0]?.Staff?.Department?.Dept_Name).toBe('Engineering');
        expect(filteredRequests[0]?.Request_Period).toBe('FULL');


      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});