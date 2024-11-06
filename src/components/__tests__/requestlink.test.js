import { mount } from '@vue/test-utils';
import RequestLinks from '@/components/RequestLinks.vue';
import { describe, it, expect } from 'vitest';
import { updateSheet } from '../../../updateGoogleSheet';

describe('RequestLinks.vue', () => {
  it('should set the default active link to "/incoming-requests"', async () => {
    const testId = 'TC-001';
    try {
      const wrapper = mount(RequestLinks);
      expect(wrapper.vm.activeLink).toBe('/incoming-requests');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should return true when the active link is "/incoming-requests"', async () => {
    const testId = 'TC-002';
    try {
      const wrapper = mount(RequestLinks);
      expect(wrapper.vm.isActive('/incoming-requests')).toBe(true);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should return false when the link is not active', async () => {
    const testId = 'TC-003';
    try {
      const wrapper = mount(RequestLinks);
      expect(wrapper.vm.isActive('/previously-accepted')).toBe(false);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should change the active link when setActiveLink is called', async () => {
    const testId = 'TC-004';
    try {
      const wrapper = mount(RequestLinks);
      wrapper.vm.setActiveLink('/previously-accepted');
      expect(wrapper.vm.activeLink).toBe('/previously-accepted');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should emit linkChange when the active link is changed', async () => {
    const testId = 'TC-005';
    try {
      const wrapper = mount(RequestLinks);
      wrapper.vm.setActiveLink('/previously-rejected');
      expect(wrapper.emitted().linkChange).toBeTruthy();
      expect(wrapper.emitted().linkChange[0]).toEqual(['/previously-rejected']);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should apply active class to the current active link', async () => {
    const testId = 'TC-006';
    try {
      const wrapper = mount(RequestLinks);
      const link = wrapper.find('.link.active');
      expect(link.text()).toBe('Incoming Requests');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('renders all links with correct text', async () => {
    const testId = 'TC-096';
    try {
      const wrapper = mount(RequestLinks);
      const links = wrapper.findAll('.link');
      expect(links).toHaveLength(3);
      expect(links.at(0).text()).toBe('Incoming Requests');
      expect(links.at(1).text()).toBe('Previously Approved');
      expect(links.at(2).text()).toBe('Previously Rejected');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('applies active class only to the selected link on click', async () => {
    const testId = 'TC-097';
    try {
      const wrapper = mount(RequestLinks);
      await wrapper.findAll('.link').at(1).trigger('click');
      expect(wrapper.vm.activeLink).toBe('/previously-accepted');
      const activeLink = wrapper.find('.link.active');
      expect(activeLink.text()).toBe('Previously Approved');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('emits the correct linkChange event on each link click', async () => {
    const testId = 'TC-098';
    try {
      const wrapper = mount(RequestLinks);
      await wrapper.findAll('.link').at(2).trigger('click');
      expect(wrapper.emitted().linkChange).toBeTruthy();
      expect(wrapper.emitted().linkChange[0]).toEqual(['/previously-rejected']);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('applies active class to the active link for styling', async () => {
    const testId = 'TC-099';
    try {
      const wrapper = mount(RequestLinks);
      const link = wrapper.find('.link.active');
      expect(link.classes()).toContain('active'); // Check for active class
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
