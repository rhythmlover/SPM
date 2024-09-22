import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({});

  // const count = ref(0)
  // const doubleCount = computed(() => count.value * 2)
  // function increment() {
  //   count.value++
  // }

  const setUserInfo = (newInfo) => {
    userInfo.value = newInfo;
  };

  return { userInfo, setUserInfo };
});
