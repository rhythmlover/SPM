import {
  highlightedNavItemStyle,
  formatDateFromStr,
  getRequestStatusPillColor,
} from '@/utils/utils';
import { describe, it, expect, vi } from 'vitest';
import { useRoute } from 'vue-router';
import { updateSheet } from '../../../updateGoogleSheet';

// Mocking vue-router's useRoute
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}));

// const testId = 'TC-075';
// try {

//   await updateSheet(testId, 'Passed');
// } catch (error) {
//   await updateSheet(testId, 'Failed');
//   throw error;
// }

describe('highlightedNavItemStyle', () => {
  it('returns correct styles when route name matches', () => {
    useRoute.mockReturnValue({ name: 'dashboard' });

    const result = highlightedNavItemStyle('dashboard');

    expect(result).toEqual({
      'border-bottom': true,
      'border-3': true,
      'border-dark': true,
    });
  });

  it('returns correct styles when route name does not match', () => {
    useRoute.mockReturnValue({ name: 'settings' });

    const result = highlightedNavItemStyle('dashboard');

    expect(result).toEqual({
      'border-bottom': false,
      'border-3': false,
      'border-dark': false,
    });
  });
});

describe('formatDateFromStr', () => {
  it('formats date string correctly', () => {
    const result = formatDateFromStr('2023-10-22');
    expect(result).toBe('Sunday, October 22');
  });

  it('handles invalid date strings gracefully', () => {
    const result = formatDateFromStr('invalid-date');
    expect(result).toBe('Invalid Date');
  });

  it('formats date correctly for different time zones', () => {
    const result = formatDateFromStr('2024-02-15');
    expect(result).toBe('Thursday, February 15');
  });
});

describe('getRequestStatusPillColor', () => {
  it('returns success for approved status', () => {
    const result = getRequestStatusPillColor('approved');
    expect(result).toBe('success');
  });

  it('returns warning for pending and withdrawal pending statuses', () => {
    expect(getRequestStatusPillColor('pending')).toBe('warning');
    expect(getRequestStatusPillColor('withdrawal pending')).toBe('warning');
  });

  it('returns danger for rejected status', () => {
    const result = getRequestStatusPillColor('rejected');
    expect(result).toBe('danger');
  });

  it('returns secondary for unknown status', () => {
    const result = getRequestStatusPillColor('unknown');
    expect(result).toBe('secondary');
  });

  it('is case-insensitive for status', () => {
    const result = getRequestStatusPillColor('ApPrOvEd');
    expect(result).toBe('success');
  });
});
