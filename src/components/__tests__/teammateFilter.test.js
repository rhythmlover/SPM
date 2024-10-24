import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import TeammateFilter from '../TeammateFilter.vue';
import { updateSheet } from '../../../updateGoogleSheet';

describe('TeammateFilter', () => {
  let wrapper;
  let teammates;
  let selectedTeammates;
  let statusOptions;
  let selectedStatuses;

  beforeEach(() => {
    teammates = [
      { Staff_ID: '1', Staff_FName: 'John', Staff_LName: 'Doe' },
      { Staff_ID: '2', Staff_FName: 'Jane', Staff_LName: 'Smith' },
      { Staff_ID: '3', Staff_FName: 'Bob', Staff_LName: 'Johnson' },
    ];
    selectedTeammates = ref([]);
    statusOptions = [
      { value: 'Pending', text: 'Pending' },
      { value: 'Approved', text: 'Approved' },
      { value: 'Rejected', text: 'Rejected' },
    ];
    selectedStatuses = ref([]);
    wrapper = mount(TeammateFilter, {
      props: {
        teammates,
        selectedTeammates: selectedTeammates.value,
        statusOptions,
        selectedStatuses: selectedStatuses.value,
      },
      global: {
        stubs: ['BDropdown', 'BDropdownForm', 'BFormCheckbox'],
      },
    });
  });

  it('should initialize with all teammates and statuses selected', async () => {
    const testId = 'TC-054';
    try {
      await nextTick();
      expect(wrapper.vm.localSelectedTeammates.size).toBe(3);
      expect(wrapper.vm.localSelectedStatuses.size).toBe(3);
      expect(wrapper.vm.selectAllTeammates).toBe(true);
      expect(wrapper.vm.selectAllStatuses).toBe(true);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should deselect all teammates when "Select All" is unchecked', async () => {
    const testId = 'TC-055';
    try {
      await wrapper.setProps({ selectedTeammates: ['1', '2', '3'] });
      await nextTick();
      wrapper.vm.selectAllTeammates = false;
      await nextTick();
      expect(wrapper.vm.localSelectedTeammates.size).toBe(0);
      expect(wrapper.emitted()['update:selectedTeammates'][0]).toEqual([
        ['1', '2', '3'],
      ]);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should toggle individual teammate selection', async () => {
    const testId = 'TC-056';
    try {
      await wrapper.setProps({ selectedTeammates: ['1', '2', '3'] });
      await nextTick();
      wrapper.vm.toggleTeammate('2');
      await nextTick();
      expect(wrapper.vm.localSelectedTeammates.size).toBe(2);
      expect(wrapper.vm.selectAllTeammates).toBe(false);
      expect(wrapper.emitted()['update:selectedTeammates'][0]).toEqual([
        ['1', '2', '3'],
      ]);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should update when selectedTeammates prop changes', async () => {
    const testId = 'TC-057';
    try {
      await wrapper.setProps({ selectedTeammates: ['1', '2'] });
      await nextTick();
      expect(wrapper.vm.localSelectedTeammates.size).toBe(2);
      expect(wrapper.vm.selectAllTeammates).toBe(false);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should select all teammates when "Select All" is checked', async () => {
    const testId = 'TC-058';
    try {
      await wrapper.setProps({ selectedTeammates: ['1'] });
      await nextTick();
      wrapper.vm.selectAllTeammates = true;
      await nextTick();
      expect(wrapper.vm.localSelectedTeammates.size).toBe(3);
      expect(wrapper.emitted()['update:selectedTeammates'][0]).toEqual([
        ['1', '2', '3'],
      ]);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should toggle status selection', async () => {
    const testId = 'TC-059';
    try {
      wrapper.vm.toggleStatus('Approved');
      await nextTick();
      expect(wrapper.vm.localSelectedStatuses.size).toBe(2);
      expect(wrapper.vm.selectAllStatuses).toBe(false);
      expect(wrapper.emitted()['update:selectedStatuses'][0]).toEqual([
        ['Pending', 'Approved', 'Rejected'],
      ]);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
