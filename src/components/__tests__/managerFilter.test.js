import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
// import { nextTick, ref } from 'vue';
import ManagerFilter from '../ScheduleFilters.vue';
import { updateSheet } from '../../../updateGoogleSheet';

describe('ManagerFilter', () => {
  let wrapper;

  const defaultProps = {
    isMonthView: true,
    statusOptions: [
      { value: 'approved', text: 'Approved' },
      { value: 'pending', text: 'Pending' },
    ],
    wfhTimeOptions: [
      { value: 'AM', text: 'AM' },
      { value: 'PM', text: 'PM' },
    ],
    managerOptions: [
      { value: 'manager1', text: 'Manager 1', depth: 0 },
      { value: 'manager2', text: 'Manager 2', depth: 1 },
    ],
    selectedStatuses: [],
    selectedWfhTimes: [],
    selectedManager: '',
  };

  beforeEach(() => {
    wrapper = mount(ManagerFilter, {
      props: defaultProps,
    });
  });

  it('should display the correct status options in the dropdown', async () => {
    const testId = 'TC-070';
    try {
      const statusDropdown = wrapper.findAllComponents({ name: 'BFormCheckbox' })
      .filter(c => defaultProps.statusOptions.some(option => option.text === c.text()));
    
    expect(statusDropdown.length).toBe(defaultProps.statusOptions.length);
    statusDropdown.forEach((checkbox, index) => {
      expect(checkbox.text()).toBe(defaultProps.statusOptions[index].text);
    });

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should indent manager options based on depth', async () => {
    const testId = 'TC-071';
    try {
      const indentedOptions = wrapper.vm.indentedManagerOptions;
      expect(indentedOptions[1].text).toContain('\u00A0\u00A0\u00A0\u00A0');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });


  it('should emit update:selectedManager when manager selection changes', async () => {
    const testId = 'TC-121';
    try {
      const managerSelect = wrapper.findAllComponents({ name: 'BFormSelect' }).at(1);
      await managerSelect.setValue('manager1');

      expect(wrapper.emitted('update:selectedManager')).toBeTruthy();
      expect(wrapper.emitted('update:selectedManager')[0]).toEqual(['manager1']);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should maintain state across props changes', async () => {
    const testId = 'TC-122';
    try {
      await wrapper.setProps({ selectedStatuses: ['pending'] });
      expect(wrapper.vm.localSelectedStatuses).toEqual(['pending']);

      await wrapper.setProps({ selectedWfhTimes: ['AM'] });
      expect(wrapper.vm.localSelectedWfhTimes).toEqual(['AM']);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  // it('should display the correct WFH time options in the dropdown', async () => {
  //   const testId = 'TC-123';
  //   try {
  //     const wfhCheckboxes = wrapper.findAllComponents({ name: 'BFormCheckbox' });

  //     // First checkbox should be the "Select All" option
  //     expect(wfhCheckboxes[5].text()).toBe('Select All');

  //     // Remaining checkboxes should match the individual WFH time options
  //     const individualWfhOptions = wfhCheckboxes.slice(1);
  //     expect(individualWfhOptions.length).toBe(defaultProps.wfhTimeOptions.length);

  //     individualWfhOptions.forEach((checkbox, index) => {
  //       expect(checkbox.text()).toBe(defaultProps.wfhTimeOptions[index].text);
  //     });

  //     await updateSheet(testId, 'Passed');
  //   } catch (error) {
  //     await updateSheet(testId, 'Failed');
  //     throw error;
  //   }
  // });


  // it('should display the correct manager options in the dropdown', async () => {
  //   const testId = 'TC-124';
  //   try {
  //     const managerSelect = wrapper.find('select');
  //     const options = managerSelect.findAll('option');
  
  //     expect(options.length).toBe(defaultProps.managerOptions.length); 
      
  //     defaultProps.managerOptions.forEach((manager, index) => {
  //       expect(options.at(index + 1).text().trim()).toBe(manager.text);
  //     });

  //     await updateSheet(testId, 'Passed');
  //   } catch (error) {
  //     await updateSheet(testId, 'Failed');
  //     throw error;
  //   }
  // });
  
  // it('should emit update:selectedStatuses when only the "approved" status is selected', async () => {
  //   const testId = 'TC-121';
  //   try {
  
  //     // Ensure the selectedStatuses prop is initially empty to prevent interference
  //     expect(wrapper.props('selectedStatuses')).toEqual([]);
  
  //     // Find the first checkbox for status options
  //     const checkbox = wrapper.findAllComponents({ name: 'BFormCheckbox' }).at(0);
  
  //     // Simulate a click event on the "approved" checkbox
  //     await checkbox.trigger('click');
  
  //     // Check that the update:selectedStatuses event has been emitted with only 'approved'
  //     expect(wrapper.emitted('update:selectedStatuses')).toBeTruthy();
  //     expect(wrapper.emitted('update:selectedStatuses')[0]).toEqual([['approved']]);
  
  //     await updateSheet(testId, 'Passed');
  //   } catch (error) {
  //     await updateSheet(testId, 'Failed');
  //     throw error;
  //   }
  // });
  

  // it('should toggle all WFH times when selectAllWfhTimes is changed', async () => {
  //   const testId = 'TC-122';
  //   try {

  //     expect(wrapper.vm.selectAllWfhTimes).toBe(true);

  //     // Update localSelectedWfhTimes to only include 'AM'
  //     wrapper.vm.localSelectedWfhTimes = ['AM'];
  //     await wrapper.vm.$nextTick(); // Wait for reactivity
  
  //     // Check that selectAllWfhTimes is false
  //     expect(wrapper.vm.selectAllWfhTimes).toBe(false);
  
  //     // Update localSelectedWfhTimes to include both options
  //     wrapper.vm.localSelectedWfhTimes = ['AM', 'PM'];
  //     await wrapper.vm.$nextTick(); // Wait for reactivity
  
  //     // Check that selectAllWfhTimes is true
  //     expect(wrapper.vm.selectAllWfhTimes).toBe(true);

  //     await updateSheet(testId, 'Passed');
  //   } catch (error) {
  //     await updateSheet(testId, 'Failed');
  //     throw error;
  //   }
  // });

  // it('should update selectAllWfhTimes when localSelectedWfhTimes length changes', async () => {
  //   const testId = 'TC-123';
  //   try {
  //     wrapper.vm.localSelectedWfhTimes = ['AM'];
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.selectAllWfhTimes).toBe(false);

  //     wrapper.vm.localSelectedWfhTimes = ['AM', 'PM'];
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.selectAllWfhTimes).toBe(true);
  //     await updateSheet(testId, 'Passed');
  //   } catch (error) {
  //     await updateSheet(testId, 'Failed');
  //     throw error;
  //   }
  // });

  // it('should initialize selected statuses and WFH times if not provided', async () => {
  //   const testId = 'TC-126';
  //   try {
  //     expect(wrapper.vm.localSelectedStatuses).toEqual(['approved', 'pending']);
  //     expect(wrapper.vm.localSelectedWfhTimes).toEqual(['AM', 'AM']);
  //     await updateSheet(testId, 'Passed');
  //   } catch (error) {
  //     await updateSheet(testId, 'Failed');
  //     throw error;
  //   }
  // });


});


