import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
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
      const statusDropdown = wrapper
        .findAllComponents({ name: 'BFormCheckbox' })
        .filter((c) =>
          defaultProps.statusOptions.some((option) => option.text === c.text()),
        );

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
      const managerSelect = wrapper
        .findAllComponents({ name: 'BFormSelect' })
        .at(1);
      await managerSelect.setValue('manager1');

      expect(wrapper.emitted('update:selectedManager')).toBeTruthy();
      expect(wrapper.emitted('update:selectedManager')[0]).toEqual([
        'manager1',
      ]);
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

  it('should display the correct WFH period options in the dropdown', async () => {
    const testId = 'TC-123';
    try {
      const wfhTimeDropdown = wrapper
        .findAllComponents({ name: 'BFormCheckbox' })
        .filter((checkbox) => {
          return ['AM', 'PM'].includes(checkbox.text());
        });

      expect(wfhTimeDropdown).toHaveLength(2);
      expect(wfhTimeDropdown[0].text()).toBe('AM');
      expect(wfhTimeDropdown[1].text()).toBe('PM');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should display the correct manager options in the dropdown', async () => {
    const testId = 'TC-124';
    try {
      const managerSelect = wrapper.find('[data-testid="manager-select"]');
      const options = managerSelect.findAll('option');

      expect(options[0].text()).toBe('All Managers');
      expect(options[0].element.value).toBe('');

      expect(options[1].text()).toBe('Manager 1');
      expect(options[1].element.value).toBe('manager1');
      expect(options[2].text()).toBe('Manager 2');
      expect(options[2].element.value).toBe('manager2');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should emit update:selectedStatuses when status selection changes', async () => {
    const testId = 'TC-125';
    try {
      const checkboxes = wrapper.findAllComponents({ name: 'BFormCheckbox' });

      const approvedCheckbox = checkboxes.find(
        (checkbox) => checkbox.text() === 'Approved',
      );
      await approvedCheckbox.setValue(true);

      expect(wrapper.emitted('update:selectedStatuses')).toBeTruthy();
      expect(wrapper.emitted('update:selectedStatuses')[0][0]).toContain(
        'approved',
      );

      await approvedCheckbox.setValue(false);
      expect(wrapper.emitted('update:selectedStatuses')[1][0]).not.toContain(
        'approved',
      );

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should emit update:selectedWfhTimes when WFH timing selection changes', async () => {
    const testId = 'TC-126';
    try {
      const wfhCheckboxes = wrapper.findAll('input[type="checkbox"]');
      const amCheckbox = wfhCheckboxes.find((c) => c.element.value === 'AM');

      await amCheckbox.setChecked();
      expect(wrapper.emitted('update:selectedWfhTimes')).toBeTruthy();
      expect(wrapper.emitted('update:selectedWfhTimes')[0][0]).toContain('AM');

      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
