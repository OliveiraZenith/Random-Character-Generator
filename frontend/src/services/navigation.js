export const navigateWithTransition = (href, delay = 450) => {
  const overlay = document.getElementById('page-transition');
  if (overlay) {
    overlay.classList.add('active');
    setTimeout(() => {
      window.location.href = href;
    }, delay);
  } else {
    window.location.href = href;
  }
};
