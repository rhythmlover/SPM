import { useRoute } from 'vue-router';

export const highlightedNavItemStyle = (routeName) => {
  const route = useRoute();
  return {
    'border-bottom': route.name === routeName,
    'border-3': route.name === routeName,
    'border-dark': route.name === routeName,
  };
};

export const formatDateFromStr = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get status color for pill
 */
export const getRequestStatusPillColor = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
    case 'withdrawal pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'secondary';
  }
};

export const moreThanTwoMonths = (WFH_Date) => {
  const twoMonthsBefore = new Date();
  twoMonthsBefore.setMonth(twoMonthsBefore.getMonth() - 2);
  const wfhDateObj = new Date(WFH_Date);
  return wfhDateObj <= twoMonthsBefore;
};

export const getWFHRequests = async (axios, API_ROUTE, staffID) => {
  try {
    const res = await axios.get(`${API_ROUTE}/wfh-request/user`, {
      params: { staffID },
    });

    if (res.data && Array.isArray(res.data.results)) {
      return res.data.results
        .filter((requestObj) => moreThanTwoMonths(requestObj['WFH_Date']))
        .map((request) => ({
          Approver_Name:
            request.Approver.Staff_FName + ' ' + request.Approver.Staff_LName,
          Staff_ID: request.Staff_ID,
          Request_ID: request.Request_ID,
          Request_Date: request.Request_Date,
          WFH_Date: request.WFH_Date,
          Request_Period: request.Request_Period,
          Reason: request.Request_Reason,
          Status: request.Status,
          Comments: request.Comments,
        }));
    } else {
      console.warn('No valid results found in the response.');
    }
  } catch (error) {
    console.error('Error fetching WFH requests:', error);
  }
};
