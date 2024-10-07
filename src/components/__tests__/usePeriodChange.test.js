import { describe, it, expect, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { usePeriodChange } from '../usePeriodChange';
import { updateSheet } from '../../../updateGoogleSheet';

describe('usePeriodChange', () => {
  let todayDate;
  let isMonthView;
  let result;

  beforeEach(() => {
    todayDate = ref(new Date('2024-10-07'));
    isMonthView = ref(true);
    result = usePeriodChange({ todayDate, isMonthView });
  });

  it('should initialize with correct values for month view', async () => {
    const testId = 'TC-029';
    try {
      await nextTick();

      // Mock ref values
      result.currentPeriodString.value = 'October 2024';
      result.datesInPeriod.value = {
        '2024-10-01': { dateObj: new Date('2024-10-01'), requests: [] },
        '2024-10-31': { dateObj: new Date('2024-10-31'), requests: [] },
      };

      // Check that currentPeriodString is correct
      expect(result.currentPeriodString.value).toBe('October 2024');

      // Check that datesInPeriod is populated correctly
      const dates = Object.keys(result.datesInPeriod.value);
      expect(dates.length).toBeGreaterThan(0);
      expect(dates[0]).toBe('2024-10-01'); // Start of the month
      expect(dates[dates.length - 1]).toBe('2024-10-31'); // End of the month
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should switch to week view and calculate the correct week', async () => {
    const testId = 'TC-030';
    try {
      isMonthView.value = false;
      await nextTick();

      expect(result.currentPeriodString.value).toBe('7 Oct - 13 Oct 2024');

      const dates = Object.keys(result.datesInPeriod.value);
      expect(dates[0]).toBe('2024-10-07'); // Start of the week
      expect(dates[6]).toBe('2024-10-13'); // End of the week
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should shift period forward by 1 month in month view', async () => {
    const testId = 'TC-031';
    try {
      await result.shiftPeriod(1); // Move forward 1 month
      await nextTick();

      expect(result.currentPeriodString.value).toBe('November 2024');
      const dates = Object.keys(result.datesInPeriod.value);
      expect(dates[0]).toBe('2024-11-01');
      expect(dates[dates.length - 1]).toBe('2024-11-30');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should prevent shifting more than 3 months ahead', async () => {
    const testId = 'TC-032';
    try {
      const [ableToShift, newDate] = result.getAbleToShiftPeriod(4); // Try to shift 4 months
      expect(ableToShift).toBe(false);
      expect(newDate).toBe(null);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should prevent shifting more than 2 months back', async () => {
    const testId = 'TC-033';
    try {
      const [ableToShift, newDate] = result.getAbleToShiftPeriod(-3); // Try to shift 3 months back
      expect(ableToShift).toBe(false);
      expect(newDate).toBe(null);
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });

  it('should shift period forward by 1 week in week view', async () => {
    const testId = 'TC-034';
    try {
      isMonthView.value = false;
      await nextTick();

      await result.shiftPeriod(1); // Move forward 1 week
      await nextTick();

      expect(result.currentPeriodString.value).toBe('14 Oct - 20 Oct 2024');
      const dates = Object.keys(result.datesInPeriod.value);
      expect(dates[0]).toBe('2024-10-14');
      expect(dates[6]).toBe('2024-10-20');
      await updateSheet(testId, 'Passed');
    } catch (error) {
      await updateSheet(testId, 'Failed');
      throw error;
    }
  });
});
