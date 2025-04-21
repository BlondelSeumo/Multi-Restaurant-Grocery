export const updateFavicon = (url) => {
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = url?.length ? url : '/favicon.png';
  document.getElementsByTagName('head')[0].appendChild(link);
};
