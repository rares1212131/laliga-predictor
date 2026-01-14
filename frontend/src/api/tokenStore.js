export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
    console.log('[TokenStore] Access token saved ✔');
  } else {
    localStorage.removeItem('accessToken');
    console.log('[TokenStore] Access token cleared ✔');
  }
};