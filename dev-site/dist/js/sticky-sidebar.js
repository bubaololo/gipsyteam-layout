const aside = document.querySelector('[data-sticky="true"]');
const startScroll = 32;
const bottomOffset = 32;
let endScroll = window.innerHeight - aside.offsetHeight;
let currPos = window.scrollY;
let screenHeight = window.innerHeight;
let asideHeight = aside.offsetHeight;
aside.style.top = startScroll + 'px';

window.addEventListener('resize', () => {
  screenHeight = window.innerHeight;
  asideHeight = aside.offsetHeight;
});

document.addEventListener('scroll', () => {
  endScroll = window.innerHeight - aside.offsetHeight;
  const asideTop = parseInt(aside.style.top.replace('px;', ''));
  if (asideHeight > screenHeight) {
    if (window.scrollY < currPos) {
      // scroll up
      if (asideTop < startScroll) {
        aside.style.top = (asideTop + currPos - window.scrollY) + 'px';
      } else if (asideTop >= startScroll && asideTop !== startScroll) {
        aside.style.top = startScroll + 'px';
      }
    } else {
      // scroll down
      if (asideTop > endScroll) {
        aside.style.top = (asideTop + currPos - window.scrollY) + 'px';
      } else if (asideTop < (endScroll) && asideTop !== endScroll) {
        aside.style.top = (endScroll - bottomOffset) + 'px';
      }
    }
  } else {
    aside.style.top = startScroll + 'px';
  }
  currPos = window.scrollY;
}, {
  capture: true,
  passive: true
});
