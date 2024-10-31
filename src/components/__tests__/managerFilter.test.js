import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import ManagerFilter from '../ScheduleFilters.vue';
import { updateSheet } from '../../../updateGoogleSheet';

describe('ManagerFilter', () => {
  let wrapper;
  let managerOptions;
  let selectedManager;
  let statusOptions;
  let selectedStatuses;
  let wfhTimeOptions;
  let selectedWfhTimes;

  beforeEach(() => {
    managerOptions = [
      { value: '1', text: 'Manager 1', depth: 0 },
      { value: '2', text: 'Manager 2', depth: 1 },
    ];
    selectedManager = ref('');
    statusOptions = [
      { value: 'Approved', text: 'Approved' },
      { value: 'Pending', text: 'Pending' },
      { value: 'Rejected', text: 'Rejected' },
      { value: 'Withdrawn', text: 'Withdrawn' },
      { value: 'Withdrawal Pending', text: 'Withdrawal Pending' },
    ];
    // selectedStatuses = ref([]);
    selectedStatuses = ref(['Approved']);
    wfhTimeOptions = [
      { value: 'FULL', text: 'Full Day' },
      { value: 'AM', text: 'AM' },
      { value: 'PM', text: 'PM' },
    ];
    selectedWfhTimes = ref([]);

    wrapper = mount(ManagerFilter, {
      props: {
        managerOptions,
        selectedManager: selectedManager.value,
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
      await wrapper.setProps({
        selectedManager: managerOptions.map((m) => m.value),
        selectedStatuses: statusOptions.map((s) => s.value),
        selectedWfhTimes: wfhTimeOptions.map((w) => w.value),
      });
      await nextTick();
      expect(wrapper.props().selectedManager.length).toBe(2);
      expect(wrapper.props().selectedStatuses.length).toBe(5);
      expect(wrapper.props().selectedWfhTimes.length).toBe(3);

      await nextTick();
      expect(wrapper.vm.selectAllWfhTimes).toBe(true);

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('Update view to display records based on filters checked', async () => {
    const testId = 'TC-071';
    try {
      wrapper.vm.localSelectedStatuses = [];
    await nextTick();

    // Update localSelectedStatuses with 'Approved' and emit the event
    wrapper.vm.localSelectedStatuses = ['Approved'];
    wrapper.vm.$emit('update:selectedStatuses', wrapper.vm.localSelectedStatuses);
    await nextTick();

    // Check emitted event for the expected value
    expect(wrapper.emitted()['update:selectedStatuses'][0]).toEqual([['Approved']]);

    const statusOptions = wrapper.vm.statusOptions.map(option => option.value);
    wrapper.vm.localSelectedStatuses = [...statusOptions];
    await nextTick();

    expect(wrapper.vm.localSelectedStatuses.length).toBe(statusOptions.length);
    expect(wrapper.vm.selectAllStatuses).toBe(true);

    wrapper.vm.$emit('update:selectedStatuses', wrapper.vm.localSelectedStatuses);
    expect(wrapper.emitted()['update:selectedStatuses'][1]).toEqual([statusOptions]);



      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

});


