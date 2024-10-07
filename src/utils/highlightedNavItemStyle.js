import { useRoute } from 'vue-router';

export const highlightedNavItemStyle = (routeName) => {
  const route = useRoute();
  return {
    'border-bottom': route.name === routeName,
    'border-3': route.name === routeName,
    'border-dark': route.name === routeName,
  };
};
