let navigator;

export const setNavigator = (navFn) => {
  navigator = navFn;
};

export const goTo = (path) => {
  if (navigator) {
    navigator(path);  // navigator가 있을 때만 이동
  } else {
    setTimeout(() => goTo(path), 100);  // navigator가 설정될 때까지 대기 후 재시도
  }
};