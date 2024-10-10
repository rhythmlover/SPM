import { onMounted, watch, ref } from 'vue';

// isMonthView = Filtering by day or month
export const usePeriodChange = ({
  todayDate = ref(new Date()),
  isMonthView = ref(true),
}) => {
  const viewingDate = ref(new Date(todayDate.value));
  const currentPeriodString = ref('');
  const datesInPeriod = ref({});

  const getCurrentPeriodString = () => {
    if (isMonthView.value) {
      // Update ref
      currentPeriodString.value = viewingDate.value.toLocaleString('en-GB', {
        month: 'long',
        year: 'numeric',
      });
    } else {
      const endOfWeek = new Date(viewingDate.value);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      // Update ref
      currentPeriodString.value = `${viewingDate.value.toLocaleDateString(
        'en-GB',
        {
          month: 'short',
          day: 'numeric',
        },
      )} - ${endOfWeek.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
  };

  const getMonthDifference = (startDate, endDate) => {
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth(); // Months are zero-based
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    // Calculate the year and month difference
    const yearDifference = endYear - startYear;
    const monthDifference = endMonth - startMonth;

    // Total month difference
    return yearDifference * 12 + monthDifference;
  };

  const getAbleToShiftPeriod = (movement) => {
    // Calculate new date
    let newDate = null;
    if (isMonthView.value) {
      newDate = new Date(
        viewingDate.value.getFullYear(),
        viewingDate.value.getMonth() + movement,
        1,
      );
    } else {
      newDate = new Date(
        viewingDate.value.getFullYear(),
        viewingDate.value.getMonth(),
        viewingDate.value.getDate() + movement * 7,
      );
    }

    // Prevent viewing > 3 months and < 2 months
    let monthDiff = getMonthDifference(todayDate.value, newDate);
    if (monthDiff > 3 || monthDiff < -2) {
      return [false, null];
    }
    return [true, newDate];
  };

  /**
   * Shift the current period
   * @param movement how many periods to shift
   */
  const shiftPeriod = async (movement) => {
    let [ableToShift, shiftedDate] = getAbleToShiftPeriod(movement);
    // Assign new date if can shift
    if (!ableToShift) return;
    viewingDate.value = shiftedDate;
    // Update refs
    await getDatesInPeriod();
    getCurrentPeriodString();
  };

  /**
   * Get all dates in current period
   */
  const getDatesInPeriod = async () => {
    // Calculate Start, End dates based on period selected
    let startDate, endDate;
    const year = viewingDate.value.getFullYear();
    const month = viewingDate.value.getMonth();
    if (isMonthView.value) {
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    } else {
      startDate = new Date(viewingDate.value);
      endDate = new Date(viewingDate.value);
      endDate.setDate(endDate.getDate() + 6);
    }

    // Populate map of dates
    let newMap = {};
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const formattedDate = d.toLocaleDateString('en-CA');
      newMap[formattedDate] = { dateObj: new Date(d), requests: [] };
    }

    // Update ref
    datesInPeriod.value = newMap;
    return newMap;
  };

  watch([todayDate, isMonthView], async () => {
    await getDatesInPeriod();
    getCurrentPeriodString();
  });
  onMounted(async () => {
    await getDatesInPeriod();
    getCurrentPeriodString();
  });

  return {
    datesInPeriod,
    currentPeriodString,
    getAbleToShiftPeriod,
    shiftPeriod,
  };
};
