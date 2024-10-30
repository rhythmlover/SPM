import { createRouter, createWebHistory } from 'vue-router';
import router from '@/router';
import { ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HrNavbar from '../hr/HrNavbar.vue';

// Mock router for testing
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: router.options.routes,
});

// Mock the injected values
const staffFNameMock = ref('John');
const roleIDMock = ref('1');
const staffIDMock = ref('123');
const staffPositionMock = ref('Developer');

describe('HrNavbar.vue.', () => {
  let wrapper;

  beforeEach(async () => {
    // Mock localStorage.clear
    vi.spyOn(Storage.prototype, 'clear');
    // Mount the component with provided dependencies and router
    wrapper = mount(HrNavbar, {
      global: {
        plugins: [mockRouter],
        provide: {
          staffFName: staffFNameMock,
          roleID: roleIDMock,
          staffID: staffIDMock,
          staffPosition: staffPositionMock,
        },
      },
    });

    // Wait for the router to be ready
    await mockRouter.isReady();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks(); // Restore original implementations
    vi.clearAllMocks(); // Clear call history and reset state
  });

  //   it('renders the navbar correctly', async () => {
  //     // const testId = 'TC-015';
  //     try {
  //       // Wait for the component to fully render
  //       await wrapper.vm.$nextTick();
  //       expect(wrapper.find('.fw-bold').text()).toBe('Manager Portal');
  //       expect(wrapper.findAll('a.nav-link')).toHaveLength(2);
  //       // await updateSheet(testId, 'Passed');
  //     } catch (error) {
  //       // await updateSheet(testId, 'Failed');
  //       console.log('');
  //       throw error;
  //     }
  //   });

  //   it('renders navigation links with correct paths', () => {
  //     // const testId = 'TC-015';
  //     try {
  //       const navItems = wrapper.findAll('a.nav-link');
  //       const expectedPaths = [
  //         '/manager-view-schedule',
  //         '/pending-requests',
  //       ];

  //       navItems.forEach((item, index) => {
  //         expect(item.attributes('href')).toBe(expectedPaths[index]);
  //       });
  //       // await updateSheet(testId, 'Passed');
  //     } catch (error) {
  //       // await updateSheet(testId, 'Failed');
  //       console.log('');
  //       throw error;
  //     }
  //   });

  it('displays welcome message with staff first name', () => {
    // const testId = 'TC-015';
    try {
      expect(wrapper.find('.user-dropdown').text()).toContain(
        `Welcome ${staffFNameMock.value}!`,
      );
      // await updateSheet(testId, 'Passed');
    } catch (error) {
      // await updateSheet(testId, 'Failed');
      console.log('');
      throw error;
    }
  });

  it('calls logout function and clears localStorage', async () => {
    // const testId = 'TC-015';
    try {
      await wrapper.find('.dropdown-item').trigger('click');
      // Ensure localStorage is cleared
      expect(localStorage.clear).toHaveBeenCalled();
      expect(wrapper.vm.$router.currentRoute.value.path).toBe('/'); // Check if routed to home
      // await updateSheet(testId, 'Passed');
    } catch (error) {
      // await updateSheet(testId, 'Failed');
      console.log('');
      throw error;
    }
  });
});
