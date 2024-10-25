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
