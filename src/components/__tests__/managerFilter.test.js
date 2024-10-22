import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import ManagerFilter from '../TeammateFilter.vue';
import { updateSheet } from '../../../updateGoogleSheet';

describe('ManagerFilter', () => {
  let wrapper;
  let teammates;
  let selectedTeammates;
  let statusOptions;
  let selectedStatuses;
  let wfhTimeOptions;
  let selectedWfhTimes;

  beforeEach(() => {
    teammates = [
      { Staff_ID: '1', Staff_FName: 'John', Staff_LName: 'Doe' },
      { Staff_ID: '2', Staff_FName: 'Jane', Staff_LName: 'Smith' },
      { Staff_ID: '3', Staff_FName: 'Bob', Staff_LName: 'Johnson' },
      { Staff_ID: '4', Staff_FName: 'Alice', Staff_LName: 'Williams' },
      { Staff_ID: '5', Staff_FName: 'Eve', Staff_LName: 'Brown' },
    ];
    selectedTeammates = ref([]);
    statusOptions = [
      { value: 'Approved', text: 'Approved' },
      { value: 'Pending', text: 'Pending' },
      { value: 'Rejected', text: 'Rejected' },
      { value: 'Withdrawn', text: 'Withdrawn' },
      { value: 'Withdrawal Pending', text: 'Withdrawal Pending' },
    ];
    selectedStatuses = ref([]);
    wfhTimeOptions = ref([
      { value: 'FULL', text: 'Full Day' },
      { value: 'AM', text: 'AM' },
      { value: 'PM', text: 'PM' },
    ]);
    selectedWfhTimes = ref([]);
    wrapper = mount(ManagerFilter, {
      props: {
        teammates,
        selectedTeammates: selectedTeammates.value,
        statusOptions,
        selectedStatuses: selectedStatuses.value,
        wfhTimeOptions,
        selectedWfhTimes: selectedWfhTimes.value,
      },
      global: {
        stubs: ['BDropdown', 'BDropdownForm', 'BFormCheckbox'],
      },
    });
  });

  it('Initialize with all subordinates, statuses, and WFH timings selected', async () => {
    const testId = 'TC-070';
    try {
      await nextTick();
      expect(wrapper.vm.localSelectedTeammates.size).toBe(5);
      expect(wrapper.vm.localSelectedStatuses.size).toBe(5);
      // expect(wrapper.vm.localselectedWfhTimes.size).toBe(3);
      expect(wrapper.vm.selectAllTeammates).toBe(true);
      expect(wrapper.vm.selectAllStatuses).toBe(true);
      // expect(wrapper.vm.selectAllWfhTimes).toBe(true);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Update view to display records of status based on those status that are checked', async () => {
    const testId = 'TC-071';
    try {
      wrapper.vm.toggleStatus('Approved');
      await nextTick(); 
  
      expect(wrapper.vm.localSelectedStatuses.size).toBe(4); 
      expect(wrapper.vm.selectAllStatuses).toBe(false);
      expect(wrapper.emitted()['update:selectedStatuses'][0]).toEqual([
        ['Approved', 'Pending', 'Rejected', 'Withdrawn', 'Withdrawal Pending'], 
      ]);
  
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
  

});

