import $ from 'jquery';
import gsap from 'gsap';
import BezierEasing from 'bezier-easing';

function addBlur(wrap, time) {
  $(wrap).addClass('s3d-blur');
  setTimeout(() => {
    $(wrap).removeClass('s3d-blur');
  }, time || 700);
}

function unActive() {
  $('.js-s3d__slideModule').removeClass('s3d-unActive');
}

function preloader() {
  return {
    show() {
      $('.fs-preloader').addClass('preloader-active');
      $('.fs-preloader-bg').css({ filter: 'blur(10px)' });
    },
    hide() {
      setTimeout(() => {
        $('.fs-preloader').removeClass('preloader-active');
        $('.fs-preloader-bg').css({ filter: 'none' });
        $('.first-loader').removeClass('first-loader');
      }, 200);
    },
    turnOn(el) {
      if (el && el.length > 0) {
        el.addClass('s3d-unActive').prop('disabled', true);
        return;
      }
      const arr = ['.s3d__button', '.js-s3d-select[data-type="plannings"]', '.js-s3d-controller__openFilter'];
      arr.forEach(name => {
        $(name).addClass('s3d-unActive').prop('disabled', true);
      });
    },
    turnOff(el) {
      if (el && el.length > 0) {
        el.removeClass('s3d-unActive').prop('disabled', false);
        return;
      }
      const arr = ['.s3d__button', '.s3d-ctr__option', '.js-s3d-select[data-type="plannings"]', '.js-s3d-controller__openFilter'];
      arr.forEach(name => {
        $(name).removeClass('s3d-unActive').prop('disabled', false);
      });
    },
    miniOn() {
      $('.js-fs-preloader-before').addClass('preloader-active');
    },
    miniOff() {
      $('.js-fs-preloader-before').removeClass('preloader-active');
    },
  };
}

function preloaderWithoutPercent() {
  const container = document.querySelector('.js-s3d-preloader');
  const logoContainer = document.querySelector('.js-s3d-preloader-logo');
  const bgContainer = document.querySelector('.js-s3d-preloader-bg');
  const easing = new BezierEasing(0, 1, 1, 0);

  const animate = gsap.timeline({
    duration: 0.8,
    ease: easing,
  });

  return {
    isAnimating: false,
    show() {
      this.isAnimating = true;
      container.classList.add('preloader-active');
      animate.fromTo(container, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 })
        .fromTo(bgContainer, { y: '100%' }, { y: 0, duration: 0.3 }, '>')
        .fromTo(logoContainer, { autoAlpha: 0 }, { autoAlpha: 1 }, '>')
        .then(() => {
          this.isAnimating = false;
        });
    },
    hide() {
      if (!this.isAnimating) {
        animate.fromTo(logoContainer, { autoAlpha: 1 }, { autoAlpha: 0 })
          .fromTo(bgContainer, { y: 0 }, { y: '-100%', duration: 0.3 }, '>')
          .fromTo(container, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.01 }, '>')
          .then(() => {
            container.classList.remove('preloader-active');
          });
      } else {
        setTimeout(() => {
          this.hide();
        }, 100);
      }
    },
  };
}

function updateFlatFavourite(wrap, flat) {
  const input = $(`${wrap} [data-id="${flat.id}"]`).find('input');
  input.prop('checked', flat.favourite);
}

const compass = {
  setDeg(deg) {
    $('.s3d-ctr__compass svg').css('transform', `rotate(${deg}deg)`);
  },

  setSlide(activeSlide) {
    let deg;
    if (activeSlide >= 0) {
      this.compass.current = activeSlide + 1;
      deg = (360 / 120 * (activeSlide + 1)) + (360 / 120 * this.compass.default);
    } else {
      deg = this.compass.defaultDeg;
    }
    $('.s3d-ctr__compass svg').css('transform', `rotate(${deg}deg)`);
  },
};

function debounce(f, t) {
  return function (args) {
    const previousCall = this.lastCall;
    this.lastCall = Date.now();
    if (previousCall && ((this.lastCall - previousCall) <= t)) {
      clearTimeout(this.lastCallTimer);
    }
    this.lastCallTimer = setTimeout(() => f(args), t);
  };
}

export {
  addBlur, unActive, preloader, updateFlatFavourite, preloaderWithoutPercent, compass, debounce,
};
