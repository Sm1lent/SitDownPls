"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory() : typeof define === 'function' && define.amd ? define(factory) : factory();
})(void 0, function () {
  'use strict';
  /**
   * Applies the :focus-visible polyfill at the given scope.
   * A scope in this case is either the top-level Document or a Shadow Root.
   *
   * @param {(Document|ShadowRoot)} scope
   * @see https://github.com/WICG/focus-visible
   */

  function applyFocusVisiblePolyfill(scope) {
    var hadKeyboardEvent = true;
    var hadFocusVisibleRecently = false;
    var hadFocusVisibleRecentlyTimeout = null;
    var inputTypesWhitelist = {
      text: true,
      search: true,
      url: true,
      tel: true,
      email: true,
      password: true,
      number: true,
      date: true,
      month: true,
      week: true,
      time: true,
      datetime: true,
      'datetime-local': true
    };
    /**
     * Helper function for legacy browsers and iframes which sometimes focus
     * elements like document, body, and non-interactive SVG.
     * @param {Element} el
     */

    function isValidFocusTarget(el) {
      if (el && el !== document && el.nodeName !== 'HTML' && el.nodeName !== 'BODY' && 'classList' in el && 'contains' in el.classList) {
        return true;
      }

      return false;
    }
    /**
     * Computes whether the given element should automatically trigger the
     * `focus-visible` class being added, i.e. whether it should always match
     * `:focus-visible` when focused.
     * @param {Element} el
     * @return {boolean}
     */


    function focusTriggersKeyboardModality(el) {
      var type = el.type;
      var tagName = el.tagName;

      if (tagName === 'INPUT' && inputTypesWhitelist[type] && !el.readOnly) {
        return true;
      }

      if (tagName === 'TEXTAREA' && !el.readOnly) {
        return true;
      }

      if (el.isContentEditable) {
        return true;
      }

      return false;
    }
    /**
     * Add the `focus-visible` class to the given element if it was not added by
     * the author.
     * @param {Element} el
     */


    function addFocusVisibleClass(el) {
      if (el.classList.contains('focus-visible')) {
        return;
      }

      el.classList.add('focus-visible');
      el.setAttribute('data-focus-visible-added', '');
    }
    /**
     * Remove the `focus-visible` class from the given element if it was not
     * originally added by the author.
     * @param {Element} el
     */


    function removeFocusVisibleClass(el) {
      if (!el.hasAttribute('data-focus-visible-added')) {
        return;
      }

      el.classList.remove('focus-visible');
      el.removeAttribute('data-focus-visible-added');
    }
    /**
     * If the most recent user interaction was via the keyboard;
     * and the key press did not include a meta, alt/option, or control key;
     * then the modality is keyboard. Otherwise, the modality is not keyboard.
     * Apply `focus-visible` to any current active element and keep track
     * of our keyboard modality state with `hadKeyboardEvent`.
     * @param {KeyboardEvent} e
     */


    function onKeyDown(e) {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }

      if (isValidFocusTarget(scope.activeElement)) {
        addFocusVisibleClass(scope.activeElement);
      }

      hadKeyboardEvent = true;
    }
    /**
     * If at any point a user clicks with a pointing device, ensure that we change
     * the modality away from keyboard.
     * This avoids the situation where a user presses a key on an already focused
     * element, and then clicks on a different element, focusing it with a
     * pointing device, while we still think we're in keyboard modality.
     * @param {Event} e
     */


    function onPointerDown(e) {
      hadKeyboardEvent = false;
    }
    /**
     * On `focus`, add the `focus-visible` class to the target if:
     * - the target received focus as a result of keyboard navigation, or
     * - the event target is an element that will likely require interaction
     *   via the keyboard (e.g. a text box)
     * @param {Event} e
     */


    function onFocus(e) {
      // Prevent IE from focusing the document or HTML element.
      if (!isValidFocusTarget(e.target)) {
        return;
      }

      if (hadKeyboardEvent || focusTriggersKeyboardModality(e.target)) {
        addFocusVisibleClass(e.target);
      }
    }
    /**
     * On `blur`, remove the `focus-visible` class from the target.
     * @param {Event} e
     */


    function onBlur(e) {
      if (!isValidFocusTarget(e.target)) {
        return;
      }

      if (e.target.classList.contains('focus-visible') || e.target.hasAttribute('data-focus-visible-added')) {
        // To detect a tab/window switch, we look for a blur event followed
        // rapidly by a visibility change.
        // If we don't see a visibility change within 100ms, it's probably a
        // regular focus change.
        hadFocusVisibleRecently = true;
        window.clearTimeout(hadFocusVisibleRecentlyTimeout);
        hadFocusVisibleRecentlyTimeout = window.setTimeout(function () {
          hadFocusVisibleRecently = false;
        }, 100);
        removeFocusVisibleClass(e.target);
      }
    }
    /**
     * If the user changes tabs, keep track of whether or not the previously
     * focused element had .focus-visible.
     * @param {Event} e
     */


    function onVisibilityChange(e) {
      if (document.visibilityState === 'hidden') {
        // If the tab becomes active again, the browser will handle calling focus
        // on the element (Safari actually calls it twice).
        // If this tab change caused a blur on an element with focus-visible,
        // re-apply the class when the user switches back to the tab.
        if (hadFocusVisibleRecently) {
          hadKeyboardEvent = true;
        }

        addInitialPointerMoveListeners();
      }
    }
    /**
     * Add a group of listeners to detect usage of any pointing devices.
     * These listeners will be added when the polyfill first loads, and anytime
     * the window is blurred, so that they are active when the window regains
     * focus.
     */


    function addInitialPointerMoveListeners() {
      document.addEventListener('mousemove', onInitialPointerMove);
      document.addEventListener('mousedown', onInitialPointerMove);
      document.addEventListener('mouseup', onInitialPointerMove);
      document.addEventListener('pointermove', onInitialPointerMove);
      document.addEventListener('pointerdown', onInitialPointerMove);
      document.addEventListener('pointerup', onInitialPointerMove);
      document.addEventListener('touchmove', onInitialPointerMove);
      document.addEventListener('touchstart', onInitialPointerMove);
      document.addEventListener('touchend', onInitialPointerMove);
    }

    function removeInitialPointerMoveListeners() {
      document.removeEventListener('mousemove', onInitialPointerMove);
      document.removeEventListener('mousedown', onInitialPointerMove);
      document.removeEventListener('mouseup', onInitialPointerMove);
      document.removeEventListener('pointermove', onInitialPointerMove);
      document.removeEventListener('pointerdown', onInitialPointerMove);
      document.removeEventListener('pointerup', onInitialPointerMove);
      document.removeEventListener('touchmove', onInitialPointerMove);
      document.removeEventListener('touchstart', onInitialPointerMove);
      document.removeEventListener('touchend', onInitialPointerMove);
    }
    /**
     * When the polfyill first loads, assume the user is in keyboard modality.
     * If any event is received from a pointing device (e.g. mouse, pointer,
     * touch), turn off keyboard modality.
     * This accounts for situations where focus enters the page from the URL bar.
     * @param {Event} e
     */


    function onInitialPointerMove(e) {
      // Work around a Safari quirk that fires a mousemove on <html> whenever the
      // window blurs, even if you're tabbing out of the page. ¯\_(ツ)_/¯
      if (e.target.nodeName && e.target.nodeName.toLowerCase() === 'html') {
        return;
      }

      hadKeyboardEvent = false;
      removeInitialPointerMoveListeners();
    } // For some kinds of state, we are interested in changes at the global scope
    // only. For example, global pointer input, global key presses and global
    // visibility change should affect the state at every scope:


    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('visibilitychange', onVisibilityChange, true);
    addInitialPointerMoveListeners(); // For focus and blur, we specifically care about state changes in the local
    // scope. This is because focus / blur events that originate from within a
    // shadow root are not re-dispatched from the host element if it was already
    // the active element in its own scope:

    scope.addEventListener('focus', onFocus, true);
    scope.addEventListener('blur', onBlur, true); // We detect that a node is a ShadowRoot by ensuring that it is a
    // DocumentFragment and also has a host property. This check covers native
    // implementation and polyfill implementation transparently. If we only cared
    // about the native implementation, we could just check if the scope was
    // an instance of a ShadowRoot.

    if (scope.nodeType === Node.DOCUMENT_FRAGMENT_NODE && scope.host) {
      // Since a ShadowRoot is a special kind of DocumentFragment, it does not
      // have a root element to add a class to. So, we add this attribute to the
      // host element instead:
      scope.host.setAttribute('data-js-focus-visible', '');
    } else if (scope.nodeType === Node.DOCUMENT_NODE) {
      document.documentElement.classList.add('js-focus-visible');
      document.documentElement.setAttribute('data-js-focus-visible', '');
    }
  } // It is important to wrap all references to global window and document in
  // these checks to support server-side rendering use cases
  // @see https://github.com/WICG/focus-visible/issues/199


  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Make the polyfill helper globally available. This can be used as a signal
    // to interested libraries that wish to coordinate with the polyfill for e.g.,
    // applying the polyfill to a shadow root:
    window.applyFocusVisiblePolyfill = applyFocusVisiblePolyfill; // Notify interested libraries of the polyfill's presence, in case the
    // polyfill was loaded lazily:

    var event;

    try {
      event = new CustomEvent('focus-visible-polyfill-ready');
    } catch (error) {
      // IE11 does not support using CustomEvent as a constructor directly:
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('focus-visible-polyfill-ready', false, false, {});
    }

    window.dispatchEvent(event);
  }

  if (typeof document !== 'undefined') {
    // Apply the polyfill to the global document, so that no JavaScript
    // coordination is required to use the polyfill in the top-level document:
    applyFocusVisiblePolyfill(document);
  }
});
"use strict";

var body = document.body;
var container = document.querySelector('.container');
var burger = document.querySelector('.burger');
var nav = document.querySelector('.header__menu-wrap');
var header = document.querySelector('.header');
var choicesLocation = document.querySelector('#choices-location'); //smooth scroll

var anchors = document.querySelectorAll('a[href*="#"]');
anchors.forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    var bolckId = anchor.getAttribute('href').substring(1);
    document.getElementById(bolckId).scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
}); // селект

var choices1 = new Choices(choicesLocation, {
  searchEnabled: false,
  shouldSort: false
});

function dropdownAct(controlBtn, dropdown) {
  controlBtn.classList.toggle('is-active');

  if (controlBtn.classList.contains('is-active')) {
    dropdown.classList.add('is-opened');
    dropdown.style.maxHeight = dropdown.scrollHeight + "px";
  } else {
    dropdown.removeAttribute('style');
    setTimeout(function () {
      dropdown.classList.remove('is-opened');
    }, 350);
  }
} // дропдаун "Категории"


var categoriesBtn = document.querySelector('.categories__control');
var categoriesDropdown = document.querySelector('.categories__dropdown');
categoriesBtn.addEventListener("click", function () {
  dropdownAct(categoriesBtn, categoriesDropdown);
}); // свайпер хиро

var heroSwiper = new Swiper('.hero-swiper', {
  direction: 'horizontal',
  slidesPerView: 1,
  loop: true,
  spaceBetween: 10,
  pagination: {
    el: '.hero-swiper__pagination',
    type: 'bullets',
    clickable: true
  },
  a11y: {
    prevSlideMessage: 'Предыдущий слайд',
    nextSlideMessage: 'Следующий слайд'
  },
  keyboard: true
}); // свайпер спецпредложений

var specSwiper = new Swiper('.special-swiper', {
  slidesPerView: 'auto',
  navigation: {
    nextEl: '.special__swiper-button-next',
    prevEl: '.special__swiper-button-prev'
  },
  breakpoints: {
    584: {
      slidesPerGroup: 2
    },
    1000: {
      slidesPerGroup: 3
    }
  },
  a11y: {
    prevSlideMessage: 'Предыдущие слайды',
    nextSlideMessage: 'Следующие слайды'
  },
  keyboard: true
}); // свайпер секции "Полезное"

var usefulSwiper = new Swiper('.useful-swiper', {
  direction: 'horizontal',
  slidesPerView: 1,
  slidesPerGroup: 1,
  spaceBetween: 12,
  slideClass: 'useful-swiper__slide',
  navigation: {
    nextEl: '.useful__swiper-button-next',
    prevEl: '.useful__swiper-button-prev'
  },
  breakpoints: {
    581: {
      slidesPerView: 2,
      slidesPerGroup: 2,
      spaceBetween: 32
    },
    1024: {
      slidesPerView: 3,
      slidesPerGroup: 3,
      spaceBetween: 32
    },
    1230: {
      slidesPerView: 2,
      slidesPerGroup: 2,
      spaceBetween: 32
    }
  },
  a11y: {
    prevSlideMessage: 'Предыдущие слайды',
    nextSlideMessage: 'Следующие слайды'
  },
  keyboard: true
}); // расчёт ширины и позиции серого фона хэдэра

var pseudo = document.querySelector(':root');

function calcStripe() {
  pseudo.removeAttribute('style');
  var stripeShift = (container.offsetWidth - body.offsetWidth) / 2;
  pseudo.style.setProperty('--stripe-shift', "".concat(stripeShift, "px"));
  pseudo.style.setProperty('--stripe-width', "".concat(body.offsetWidth, "px"));
}

calcStripe(); // расчёт кол-ва отображаемых карточек "высокого рейтинга"

var goodsCards = document.querySelectorAll('.rated__list-item');
var rateBtn = document.querySelector('.rated__btn');
var pageWidth = body.offsetWidth;
var goodsNumber = pageWidth < 1200 ? 6 : 8;
var actualgoodsNumber = goodsNumber;
switchCards(actualgoodsNumber); // бургер и меню навигации

burger.addEventListener('click', function () {
  dropdownAct(burger, nav);
  setTimeout(function () {
    if (nav.classList.contains('is-active')) {
      adaptHeader();
    } else {
      resetHeader();
    }
  }, 10);
});

function resetHeader() {
  header.removeAttribute("style");
  unblockScroll();
}

function adaptHeader() {
  var paddingOffset = window.innerWidth - body.offsetWidth + 'px';
  blockScroll();
  header.style.paddingRight = paddingOffset;
}

function blockScroll() {
  var paddingOffset = window.innerWidth - body.offsetWidth + 'px';
  body.classList.add('is-active');
  body.style.paddingRight = paddingOffset;
}

function unblockScroll() {
  body.classList.remove('is-active');
  body.removeAttribute("style");
}

nav.addEventListener('click', function (event) {
  if (event.target.classList.contains('navigation__link') && burger.classList.contains('is-active')) {
    toggleBurgerAndMenu();
    resetHeader();
  }
}); // СОБЫТИЯ ПРИ РЕСАЙЗЕ

window.addEventListener('resize', function () {
  calcStripe();
  pageWidth = body.offsetWidth; // переключение кол-ва отображаемых карточек "высокого рейтинга"

  if (!rateBtn.classList.contains('hidden')) {
    goodsNumber = pageWidth < 1200 ? 6 : 8;

    if (goodsNumber != actualgoodsNumber) {
      actualgoodsNumber = goodsNumber;
      switchCards(actualgoodsNumber);
    }
  } // сброс отрытого меню при ресайзе


  if (window.innerWidth > 1000 && nav.classList.contains('is-active')) {
    toggleBurgerAndMenu();
    resetHeader();
  }
});

function switchCards(wantedNum) {
  if (wantedNum == 8) {
    for (var i = 6; i < 8; i++) {
      if (goodsCards[i].classList.contains('hidden')) {
        displayBlock(goodsCards[i]);
      }
    }
  }

  for (var _i = wantedNum; _i <= goodsCards.length; _i++) {
    if (goodsCards[_i]) {
      if (!goodsCards[_i].classList.contains('hidden')) {
        removeBlock(goodsCards[_i]);
      }
    }
  }
}

function displayBlock(block) {
  block.classList.remove('hidden');
}

function removeBlock(block) {
  block.classList.add('hidden');
} // показать +4 карточки товара


var btnShowMoreListener = function btnShowMoreListener() {
  for (var i = 1; i < 5; i++) {
    var cardToShow = document.querySelector('.rated__list-item.hidden');

    if (cardToShow) {
      displayBlock(cardToShow);
    } else {
      rateBtn.removeEventListener('click', btnShowMoreListener);
      removeBlock(rateBtn);
    }
  }
};

rateBtn.addEventListener('click', btnShowMoreListener); // показать тултип

var tippyBtn = document.querySelector('.mail-us__tip-btn');
tippyBtn.addEventListener('click', function () {
  tippyBtn.classList.toggle('is-active');
}); //настройки типпи-подсказки

tippy('.mail-us__tip-btn', {
  trigger: 'click',
  maxWidth: 157,
  content: 'Реплицированные с зарубежных источников, исследования формируют глобальную сеть.'
}); //инициализация маски инпута телефона
// настройка валидации формы

var validLettersRu = /^[А-Яа-я]+$/;
var validLettersEn = /^[A-Za-z]+$/;
var form = document.querySelector('.mail-us-form');
var phoneInput = document.querySelector('#phone');
var nameInput = document.querySelector('#name');
Inputmask("+7(999)-999-99-99").mask(phoneInput);
var validation = new window.JustValidate(form, {
  focusInvalidField: true,
  successFieldCssClass: 'valid-field',
  errorFieldCssClass: 'invalid-field'
});
validation.addField('#name', [{
  rule: 'minLength',
  value: 3,
  errorMessage: 'Введите минимум 3 символа'
}, {
  rule: 'maxLength',
  value: 25,
  errorMessage: 'Введите не более 25 символов'
}, {
  rule: 'required',
  value: true,
  errorMessage: 'Как вас зовут?'
}, {
  rule: 'function',
  validator: function validator() {
    var userName = nameInput.value;

    if (userName.match(validLettersRu) || userName.match(validLettersEn)) {
      return true;
    }

    return false;
  },
  errorMessage: 'Допустимы только буквы кириллицы или латыни'
}]).addField('#email', [{
  rule: 'required',
  value: true,
  errorMessage: 'Укажите вашу почту'
}, {
  rule: 'email',
  value: true,
  errorMessage: 'Введите корректный e-mail'
}]).addField('#phone', [{
  rule: 'required',
  value: true,
  errorMessage: 'Укажите ваш телефон'
}, {
  rule: 'function',
  validator: function validator() {
    var phone = phoneInput.inputmask.unmaskedvalue();
    return phone.length === 10;
  },
  errorMessage: 'Введите корректный телефон'
}]).addField('#check', [{
  rule: 'required',
  value: true,
  errorMessage: 'Необходимо подтвердить'
}]).onSuccess(function (event) {
  console.log('Validation passes and form submitted', event);
  var formData = new FormData(event.target);
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log('Отправлено');
      }
    }
  };

  xhr.open('POST', 'mail.php', true);
  xhr.send(formData);
  event.target.reset();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvY3VzLXZpc2libGUuanMiLCJtYWluLmpzIl0sIm5hbWVzIjpbImdsb2JhbCIsImZhY3RvcnkiLCJleHBvcnRzIiwibW9kdWxlIiwiZGVmaW5lIiwiYW1kIiwiYXBwbHlGb2N1c1Zpc2libGVQb2x5ZmlsbCIsInNjb3BlIiwiaGFkS2V5Ym9hcmRFdmVudCIsImhhZEZvY3VzVmlzaWJsZVJlY2VudGx5IiwiaGFkRm9jdXNWaXNpYmxlUmVjZW50bHlUaW1lb3V0IiwiaW5wdXRUeXBlc1doaXRlbGlzdCIsInRleHQiLCJzZWFyY2giLCJ1cmwiLCJ0ZWwiLCJlbWFpbCIsInBhc3N3b3JkIiwibnVtYmVyIiwiZGF0ZSIsIm1vbnRoIiwid2VlayIsInRpbWUiLCJkYXRldGltZSIsImlzVmFsaWRGb2N1c1RhcmdldCIsImVsIiwiZG9jdW1lbnQiLCJub2RlTmFtZSIsImNsYXNzTGlzdCIsImZvY3VzVHJpZ2dlcnNLZXlib2FyZE1vZGFsaXR5IiwidHlwZSIsInRhZ05hbWUiLCJyZWFkT25seSIsImlzQ29udGVudEVkaXRhYmxlIiwiYWRkRm9jdXNWaXNpYmxlQ2xhc3MiLCJjb250YWlucyIsImFkZCIsInNldEF0dHJpYnV0ZSIsInJlbW92ZUZvY3VzVmlzaWJsZUNsYXNzIiwiaGFzQXR0cmlidXRlIiwicmVtb3ZlIiwicmVtb3ZlQXR0cmlidXRlIiwib25LZXlEb3duIiwiZSIsIm1ldGFLZXkiLCJhbHRLZXkiLCJjdHJsS2V5IiwiYWN0aXZlRWxlbWVudCIsIm9uUG9pbnRlckRvd24iLCJvbkZvY3VzIiwidGFyZ2V0Iiwib25CbHVyIiwid2luZG93IiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsIm9uVmlzaWJpbGl0eUNoYW5nZSIsInZpc2liaWxpdHlTdGF0ZSIsImFkZEluaXRpYWxQb2ludGVyTW92ZUxpc3RlbmVycyIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbkluaXRpYWxQb2ludGVyTW92ZSIsInJlbW92ZUluaXRpYWxQb2ludGVyTW92ZUxpc3RlbmVycyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ0b0xvd2VyQ2FzZSIsIm5vZGVUeXBlIiwiTm9kZSIsIkRPQ1VNRU5UX0ZSQUdNRU5UX05PREUiLCJob3N0IiwiRE9DVU1FTlRfTk9ERSIsImRvY3VtZW50RWxlbWVudCIsImV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJlcnJvciIsImNyZWF0ZUV2ZW50IiwiaW5pdEN1c3RvbUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsImJvZHkiLCJjb250YWluZXIiLCJxdWVyeVNlbGVjdG9yIiwiYnVyZ2VyIiwibmF2IiwiaGVhZGVyIiwiY2hvaWNlc0xvY2F0aW9uIiwiYW5jaG9ycyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwiYW5jaG9yIiwicHJldmVudERlZmF1bHQiLCJib2xja0lkIiwiZ2V0QXR0cmlidXRlIiwic3Vic3RyaW5nIiwiZ2V0RWxlbWVudEJ5SWQiLCJzY3JvbGxJbnRvVmlldyIsImJlaGF2aW9yIiwiYmxvY2siLCJjaG9pY2VzMSIsIkNob2ljZXMiLCJzZWFyY2hFbmFibGVkIiwic2hvdWxkU29ydCIsImRyb3Bkb3duQWN0IiwiY29udHJvbEJ0biIsImRyb3Bkb3duIiwidG9nZ2xlIiwic3R5bGUiLCJtYXhIZWlnaHQiLCJzY3JvbGxIZWlnaHQiLCJjYXRlZ29yaWVzQnRuIiwiY2F0ZWdvcmllc0Ryb3Bkb3duIiwiaGVyb1N3aXBlciIsIlN3aXBlciIsImRpcmVjdGlvbiIsInNsaWRlc1BlclZpZXciLCJsb29wIiwic3BhY2VCZXR3ZWVuIiwicGFnaW5hdGlvbiIsImNsaWNrYWJsZSIsImExMXkiLCJwcmV2U2xpZGVNZXNzYWdlIiwibmV4dFNsaWRlTWVzc2FnZSIsImtleWJvYXJkIiwic3BlY1N3aXBlciIsIm5hdmlnYXRpb24iLCJuZXh0RWwiLCJwcmV2RWwiLCJicmVha3BvaW50cyIsInNsaWRlc1Blckdyb3VwIiwidXNlZnVsU3dpcGVyIiwic2xpZGVDbGFzcyIsInBzZXVkbyIsImNhbGNTdHJpcGUiLCJzdHJpcGVTaGlmdCIsIm9mZnNldFdpZHRoIiwic2V0UHJvcGVydHkiLCJnb29kc0NhcmRzIiwicmF0ZUJ0biIsInBhZ2VXaWR0aCIsImdvb2RzTnVtYmVyIiwiYWN0dWFsZ29vZHNOdW1iZXIiLCJzd2l0Y2hDYXJkcyIsImFkYXB0SGVhZGVyIiwicmVzZXRIZWFkZXIiLCJ1bmJsb2NrU2Nyb2xsIiwicGFkZGluZ09mZnNldCIsImlubmVyV2lkdGgiLCJibG9ja1Njcm9sbCIsInBhZGRpbmdSaWdodCIsInRvZ2dsZUJ1cmdlckFuZE1lbnUiLCJ3YW50ZWROdW0iLCJpIiwiZGlzcGxheUJsb2NrIiwibGVuZ3RoIiwicmVtb3ZlQmxvY2siLCJidG5TaG93TW9yZUxpc3RlbmVyIiwiY2FyZFRvU2hvdyIsInRpcHB5QnRuIiwidGlwcHkiLCJ0cmlnZ2VyIiwibWF4V2lkdGgiLCJjb250ZW50IiwidmFsaWRMZXR0ZXJzUnUiLCJ2YWxpZExldHRlcnNFbiIsImZvcm0iLCJwaG9uZUlucHV0IiwibmFtZUlucHV0IiwiSW5wdXRtYXNrIiwibWFzayIsInZhbGlkYXRpb24iLCJKdXN0VmFsaWRhdGUiLCJmb2N1c0ludmFsaWRGaWVsZCIsInN1Y2Nlc3NGaWVsZENzc0NsYXNzIiwiZXJyb3JGaWVsZENzc0NsYXNzIiwiYWRkRmllbGQiLCJydWxlIiwidmFsdWUiLCJlcnJvck1lc3NhZ2UiLCJ2YWxpZGF0b3IiLCJ1c2VyTmFtZSIsIm1hdGNoIiwicGhvbmUiLCJpbnB1dG1hc2siLCJ1bm1hc2tlZHZhbHVlIiwib25TdWNjZXNzIiwiY29uc29sZSIsImxvZyIsImZvcm1EYXRhIiwiRm9ybURhdGEiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJvcGVuIiwic2VuZCIsInJlc2V0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUMsV0FBVUEsTUFBVixFQUFrQkMsT0FBbEIsRUFBMkI7QUFDMUIsVUFBT0MsT0FBUCx5Q0FBT0EsT0FBUCxPQUFtQixRQUFuQixJQUErQixPQUFPQyxNQUFQ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UUFBSUYsR0FBRyxDQUFDRyxVQUFKLEtBQW1CLENBQXZCLEVBQTBCO0FBQ3hCLFVBQUlILEdBQUcsQ0FBQ0ksTUFBSixLQUFlLEdBQW5CLEVBQXdCO0FBQ3RCUixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxZQUFaO0FBQ0Q7QUFDRjtBQUNGLEdBTkQ7O0FBUUFHLEVBQUFBLEdBQUcsQ0FBQ0ssSUFBSixDQUFTLE1BQVQsRUFBaUIsVUFBakIsRUFBNkIsSUFBN0I7QUFDQUwsRUFBQUEsR0FBRyxDQUFDTSxJQUFKLENBQVNSLFFBQVQ7QUFFQWxILEVBQUFBLEtBQUssQ0FBQ25CLE1BQU4sQ0FBYThJLEtBQWI7QUFDRCxDQWxGRCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBBcHBsaWVzIHRoZSA6Zm9jdXMtdmlzaWJsZSBwb2x5ZmlsbCBhdCB0aGUgZ2l2ZW4gc2NvcGUuXG4gICAqIEEgc2NvcGUgaW4gdGhpcyBjYXNlIGlzIGVpdGhlciB0aGUgdG9wLWxldmVsIERvY3VtZW50IG9yIGEgU2hhZG93IFJvb3QuXG4gICAqXG4gICAqIEBwYXJhbSB7KERvY3VtZW50fFNoYWRvd1Jvb3QpfSBzY29wZVxuICAgKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL2ZvY3VzLXZpc2libGVcbiAgICovXG4gIGZ1bmN0aW9uIGFwcGx5Rm9jdXNWaXNpYmxlUG9seWZpbGwoc2NvcGUpIHtcbiAgICB2YXIgaGFkS2V5Ym9hcmRFdmVudCA9IHRydWU7XG4gICAgdmFyIGhhZEZvY3VzVmlzaWJsZVJlY2VudGx5ID0gZmFsc2U7XG4gICAgdmFyIGhhZEZvY3VzVmlzaWJsZVJlY2VudGx5VGltZW91dCA9IG51bGw7XG5cbiAgICB2YXIgaW5wdXRUeXBlc1doaXRlbGlzdCA9IHtcbiAgICAgIHRleHQ6IHRydWUsXG4gICAgICBzZWFyY2g6IHRydWUsXG4gICAgICB1cmw6IHRydWUsXG4gICAgICB0ZWw6IHRydWUsXG4gICAgICBlbWFpbDogdHJ1ZSxcbiAgICAgIHBhc3N3b3JkOiB0cnVlLFxuICAgICAgbnVtYmVyOiB0cnVlLFxuICAgICAgZGF0ZTogdHJ1ZSxcbiAgICAgIG1vbnRoOiB0cnVlLFxuICAgICAgd2VlazogdHJ1ZSxcbiAgICAgIHRpbWU6IHRydWUsXG4gICAgICBkYXRldGltZTogdHJ1ZSxcbiAgICAgICdkYXRldGltZS1sb2NhbCc6IHRydWVcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIGZvciBsZWdhY3kgYnJvd3NlcnMgYW5kIGlmcmFtZXMgd2hpY2ggc29tZXRpbWVzIGZvY3VzXG4gICAgICogZWxlbWVudHMgbGlrZSBkb2N1bWVudCwgYm9keSwgYW5kIG5vbi1pbnRlcmFjdGl2ZSBTVkcuXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzVmFsaWRGb2N1c1RhcmdldChlbCkge1xuICAgICAgaWYgKFxuICAgICAgICBlbCAmJlxuICAgICAgICBlbCAhPT0gZG9jdW1lbnQgJiZcbiAgICAgICAgZWwubm9kZU5hbWUgIT09ICdIVE1MJyAmJlxuICAgICAgICBlbC5ub2RlTmFtZSAhPT0gJ0JPRFknICYmXG4gICAgICAgICdjbGFzc0xpc3QnIGluIGVsICYmXG4gICAgICAgICdjb250YWlucycgaW4gZWwuY2xhc3NMaXN0XG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcHV0ZXMgd2hldGhlciB0aGUgZ2l2ZW4gZWxlbWVudCBzaG91bGQgYXV0b21hdGljYWxseSB0cmlnZ2VyIHRoZVxuICAgICAqIGBmb2N1cy12aXNpYmxlYCBjbGFzcyBiZWluZyBhZGRlZCwgaS5lLiB3aGV0aGVyIGl0IHNob3VsZCBhbHdheXMgbWF0Y2hcbiAgICAgKiBgOmZvY3VzLXZpc2libGVgIHdoZW4gZm9jdXNlZC5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmb2N1c1RyaWdnZXJzS2V5Ym9hcmRNb2RhbGl0eShlbCkge1xuICAgICAgdmFyIHR5cGUgPSBlbC50eXBlO1xuICAgICAgdmFyIHRhZ05hbWUgPSBlbC50YWdOYW1lO1xuXG4gICAgICBpZiAodGFnTmFtZSA9PT0gJ0lOUFVUJyAmJiBpbnB1dFR5cGVzV2hpdGVsaXN0W3R5cGVdICYmICFlbC5yZWFkT25seSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRhZ05hbWUgPT09ICdURVhUQVJFQScgJiYgIWVsLnJlYWRPbmx5KSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZWwuaXNDb250ZW50RWRpdGFibGUpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgdGhlIGBmb2N1cy12aXNpYmxlYCBjbGFzcyB0byB0aGUgZ2l2ZW4gZWxlbWVudCBpZiBpdCB3YXMgbm90IGFkZGVkIGJ5XG4gICAgICogdGhlIGF1dGhvci5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWRkRm9jdXNWaXNpYmxlQ2xhc3MoZWwpIHtcbiAgICAgIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZvY3VzLXZpc2libGUnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBlbC5jbGFzc0xpc3QuYWRkKCdmb2N1cy12aXNpYmxlJyk7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtZm9jdXMtdmlzaWJsZS1hZGRlZCcsICcnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhlIGBmb2N1cy12aXNpYmxlYCBjbGFzcyBmcm9tIHRoZSBnaXZlbiBlbGVtZW50IGlmIGl0IHdhcyBub3RcbiAgICAgKiBvcmlnaW5hbGx5IGFkZGVkIGJ5IHRoZSBhdXRob3IuXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlbW92ZUZvY3VzVmlzaWJsZUNsYXNzKGVsKSB7XG4gICAgICBpZiAoIWVsLmhhc0F0dHJpYnV0ZSgnZGF0YS1mb2N1cy12aXNpYmxlLWFkZGVkJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZm9jdXMtdmlzaWJsZScpO1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWZvY3VzLXZpc2libGUtYWRkZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGUgbW9zdCByZWNlbnQgdXNlciBpbnRlcmFjdGlvbiB3YXMgdmlhIHRoZSBrZXlib2FyZDtcbiAgICAgKiBhbmQgdGhlIGtleSBwcmVzcyBkaWQgbm90IGluY2x1ZGUgYSBtZXRhLCBhbHQvb3B0aW9uLCBvciBjb250cm9sIGtleTtcbiAgICAgKiB0aGVuIHRoZSBtb2RhbGl0eSBpcyBrZXlib2FyZC4gT3RoZXJ3aXNlLCB0aGUgbW9kYWxpdHkgaXMgbm90IGtleWJvYXJkLlxuICAgICAqIEFwcGx5IGBmb2N1cy12aXNpYmxlYCB0byBhbnkgY3VycmVudCBhY3RpdmUgZWxlbWVudCBhbmQga2VlcCB0cmFja1xuICAgICAqIG9mIG91ciBrZXlib2FyZCBtb2RhbGl0eSBzdGF0ZSB3aXRoIGBoYWRLZXlib2FyZEV2ZW50YC5cbiAgICAgKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvbktleURvd24oZSkge1xuICAgICAgaWYgKGUubWV0YUtleSB8fCBlLmFsdEtleSB8fCBlLmN0cmxLZXkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNWYWxpZEZvY3VzVGFyZ2V0KHNjb3BlLmFjdGl2ZUVsZW1lbnQpKSB7XG4gICAgICAgIGFkZEZvY3VzVmlzaWJsZUNsYXNzKHNjb3BlLmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICBoYWRLZXlib2FyZEV2ZW50ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiBhdCBhbnkgcG9pbnQgYSB1c2VyIGNsaWNrcyB3aXRoIGEgcG9pbnRpbmcgZGV2aWNlLCBlbnN1cmUgdGhhdCB3ZSBjaGFuZ2VcbiAgICAgKiB0aGUgbW9kYWxpdHkgYXdheSBmcm9tIGtleWJvYXJkLlxuICAgICAqIFRoaXMgYXZvaWRzIHRoZSBzaXR1YXRpb24gd2hlcmUgYSB1c2VyIHByZXNzZXMgYSBrZXkgb24gYW4gYWxyZWFkeSBmb2N1c2VkXG4gICAgICogZWxlbWVudCwgYW5kIHRoZW4gY2xpY2tzIG9uIGEgZGlmZmVyZW50IGVsZW1lbnQsIGZvY3VzaW5nIGl0IHdpdGggYVxuICAgICAqIHBvaW50aW5nIGRldmljZSwgd2hpbGUgd2Ugc3RpbGwgdGhpbmsgd2UncmUgaW4ga2V5Ym9hcmQgbW9kYWxpdHkuXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9uUG9pbnRlckRvd24oZSkge1xuICAgICAgaGFkS2V5Ym9hcmRFdmVudCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uIGBmb2N1c2AsIGFkZCB0aGUgYGZvY3VzLXZpc2libGVgIGNsYXNzIHRvIHRoZSB0YXJnZXQgaWY6XG4gICAgICogLSB0aGUgdGFyZ2V0IHJlY2VpdmVkIGZvY3VzIGFzIGEgcmVzdWx0IG9mIGtleWJvYXJkIG5hdmlnYXRpb24sIG9yXG4gICAgICogLSB0aGUgZXZlbnQgdGFyZ2V0IGlzIGFuIGVsZW1lbnQgdGhhdCB3aWxsIGxpa2VseSByZXF1aXJlIGludGVyYWN0aW9uXG4gICAgICogICB2aWEgdGhlIGtleWJvYXJkIChlLmcuIGEgdGV4dCBib3gpXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9uRm9jdXMoZSkge1xuICAgICAgLy8gUHJldmVudCBJRSBmcm9tIGZvY3VzaW5nIHRoZSBkb2N1bWVudCBvciBIVE1MIGVsZW1lbnQuXG4gICAgICBpZiAoIWlzVmFsaWRGb2N1c1RhcmdldChlLnRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoaGFkS2V5Ym9hcmRFdmVudCB8fCBmb2N1c1RyaWdnZXJzS2V5Ym9hcmRNb2RhbGl0eShlLnRhcmdldCkpIHtcbiAgICAgICAgYWRkRm9jdXNWaXNpYmxlQ2xhc3MoZS50YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9uIGBibHVyYCwgcmVtb3ZlIHRoZSBgZm9jdXMtdmlzaWJsZWAgY2xhc3MgZnJvbSB0aGUgdGFyZ2V0LlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBvbkJsdXIoZSkge1xuICAgICAgaWYgKCFpc1ZhbGlkRm9jdXNUYXJnZXQoZS50YXJnZXQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICBlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZvY3VzLXZpc2libGUnKSB8fFxuICAgICAgICBlLnRhcmdldC5oYXNBdHRyaWJ1dGUoJ2RhdGEtZm9jdXMtdmlzaWJsZS1hZGRlZCcpXG4gICAgICApIHtcbiAgICAgICAgLy8gVG8gZGV0ZWN0IGEgdGFiL3dpbmRvdyBzd2l0Y2gsIHdlIGxvb2sgZm9yIGEgYmx1ciBldmVudCBmb2xsb3dlZFxuICAgICAgICAvLyByYXBpZGx5IGJ5IGEgdmlzaWJpbGl0eSBjaGFuZ2UuXG4gICAgICAgIC8vIElmIHdlIGRvbid0IHNlZSBhIHZpc2liaWxpdHkgY2hhbmdlIHdpdGhpbiAxMDBtcywgaXQncyBwcm9iYWJseSBhXG4gICAgICAgIC8vIHJlZ3VsYXIgZm9jdXMgY2hhbmdlLlxuICAgICAgICBoYWRGb2N1c1Zpc2libGVSZWNlbnRseSA9IHRydWU7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoaGFkRm9jdXNWaXNpYmxlUmVjZW50bHlUaW1lb3V0KTtcbiAgICAgICAgaGFkRm9jdXNWaXNpYmxlUmVjZW50bHlUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaGFkRm9jdXNWaXNpYmxlUmVjZW50bHkgPSBmYWxzZTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgcmVtb3ZlRm9jdXNWaXNpYmxlQ2xhc3MoZS50YXJnZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHRoZSB1c2VyIGNoYW5nZXMgdGFicywga2VlcCB0cmFjayBvZiB3aGV0aGVyIG9yIG5vdCB0aGUgcHJldmlvdXNseVxuICAgICAqIGZvY3VzZWQgZWxlbWVudCBoYWQgLmZvY3VzLXZpc2libGUuXG4gICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG9uVmlzaWJpbGl0eUNoYW5nZShlKSB7XG4gICAgICBpZiAoZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlID09PSAnaGlkZGVuJykge1xuICAgICAgICAvLyBJZiB0aGUgdGFiIGJlY29tZXMgYWN0aXZlIGFnYWluLCB0aGUgYnJvd3NlciB3aWxsIGhhbmRsZSBjYWxsaW5nIGZvY3VzXG4gICAgICAgIC8vIG9uIHRoZSBlbGVtZW50IChTYWZhcmkgYWN0dWFsbHkgY2FsbHMgaXQgdHdpY2UpLlxuICAgICAgICAvLyBJZiB0aGlzIHRhYiBjaGFuZ2UgY2F1c2VkIGEgYmx1ciBvbiBhbiBlbGVtZW50IHdpdGggZm9jdXMtdmlzaWJsZSxcbiAgICAgICAgLy8gcmUtYXBwbHkgdGhlIGNsYXNzIHdoZW4gdGhlIHVzZXIgc3dpdGNoZXMgYmFjayB0byB0aGUgdGFiLlxuICAgICAgICBpZiAoaGFkRm9jdXNWaXNpYmxlUmVjZW50bHkpIHtcbiAgICAgICAgICBoYWRLZXlib2FyZEV2ZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBhZGRJbml0aWFsUG9pbnRlck1vdmVMaXN0ZW5lcnMoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBncm91cCBvZiBsaXN0ZW5lcnMgdG8gZGV0ZWN0IHVzYWdlIG9mIGFueSBwb2ludGluZyBkZXZpY2VzLlxuICAgICAqIFRoZXNlIGxpc3RlbmVycyB3aWxsIGJlIGFkZGVkIHdoZW4gdGhlIHBvbHlmaWxsIGZpcnN0IGxvYWRzLCBhbmQgYW55dGltZVxuICAgICAqIHRoZSB3aW5kb3cgaXMgYmx1cnJlZCwgc28gdGhhdCB0aGV5IGFyZSBhY3RpdmUgd2hlbiB0aGUgd2luZG93IHJlZ2FpbnNcbiAgICAgKiBmb2N1cy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhZGRJbml0aWFsUG9pbnRlck1vdmVMaXN0ZW5lcnMoKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbkluaXRpYWxQb2ludGVyTW92ZSk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkluaXRpYWxQb2ludGVyTW92ZSk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Jbml0aWFsUG9pbnRlck1vdmUpO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBvbkluaXRpYWxQb2ludGVyTW92ZSk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG9uSW5pdGlhbFBvaW50ZXJNb3ZlKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIG9uSW5pdGlhbFBvaW50ZXJNb3ZlKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uSW5pdGlhbFBvaW50ZXJNb3ZlKTtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvbkluaXRpYWxQb2ludGVyTW92ZSk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uSW5pdGlhbFBvaW50ZXJNb3ZlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVJbml0aWFsUG9pbnRlck1vdmVMaXN0ZW5lcnMoKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbkluaXRpYWxQb2ludGVyTW92ZSk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvbkluaXRpYWxQb2ludGVyTW92ZSk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Jbml0aWFsUG9pbnRlck1vdmUpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBvbkluaXRpYWxQb2ludGVyTW92ZSk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG9uSW5pdGlhbFBvaW50ZXJNb3ZlKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJ1cCcsIG9uSW5pdGlhbFBvaW50ZXJNb3ZlKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uSW5pdGlhbFBvaW50ZXJNb3ZlKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvbkluaXRpYWxQb2ludGVyTW92ZSk7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uSW5pdGlhbFBvaW50ZXJNb3ZlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGVuIHRoZSBwb2xmeWlsbCBmaXJzdCBsb2FkcywgYXNzdW1lIHRoZSB1c2VyIGlzIGluIGtleWJvYXJkIG1vZGFsaXR5LlxuICAgICAqIElmIGFueSBldmVudCBpcyByZWNlaXZlZCBmcm9tIGEgcG9pbnRpbmcgZGV2aWNlIChlLmcuIG1vdXNlLCBwb2ludGVyLFxuICAgICAqIHRvdWNoKSwgdHVybiBvZmYga2V5Ym9hcmQgbW9kYWxpdHkuXG4gICAgICogVGhpcyBhY2NvdW50cyBmb3Igc2l0dWF0aW9ucyB3aGVyZSBmb2N1cyBlbnRlcnMgdGhlIHBhZ2UgZnJvbSB0aGUgVVJMIGJhci5cbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAgICovXG4gICAgZnVuY3Rpb24gb25Jbml0aWFsUG9pbnRlck1vdmUoZSkge1xuICAgICAgLy8gV29yayBhcm91bmQgYSBTYWZhcmkgcXVpcmsgdGhhdCBmaXJlcyBhIG1vdXNlbW92ZSBvbiA8aHRtbD4gd2hlbmV2ZXIgdGhlXG4gICAgICAvLyB3aW5kb3cgYmx1cnMsIGV2ZW4gaWYgeW91J3JlIHRhYmJpbmcgb3V0IG9mIHRoZSBwYWdlLiDCr1xcXyjjg4QpXy/Cr1xuICAgICAgaWYgKGUudGFyZ2V0Lm5vZGVOYW1lICYmIGUudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdodG1sJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGhhZEtleWJvYXJkRXZlbnQgPSBmYWxzZTtcbiAgICAgIHJlbW92ZUluaXRpYWxQb2ludGVyTW92ZUxpc3RlbmVycygpO1xuICAgIH1cblxuICAgIC8vIEZvciBzb21lIGtpbmRzIG9mIHN0YXRlLCB3ZSBhcmUgaW50ZXJlc3RlZCBpbiBjaGFuZ2VzIGF0IHRoZSBnbG9iYWwgc2NvcGVcbiAgICAvLyBvbmx5LiBGb3IgZXhhbXBsZSwgZ2xvYmFsIHBvaW50ZXIgaW5wdXQsIGdsb2JhbCBrZXkgcHJlc3NlcyBhbmQgZ2xvYmFsXG4gICAgLy8gdmlzaWJpbGl0eSBjaGFuZ2Ugc2hvdWxkIGFmZmVjdCB0aGUgc3RhdGUgYXQgZXZlcnkgc2NvcGU6XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93biwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Qb2ludGVyRG93biwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBvblBvaW50ZXJEb3duLCB0cnVlKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Qb2ludGVyRG93biwgdHJ1ZSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIG9uVmlzaWJpbGl0eUNoYW5nZSwgdHJ1ZSk7XG5cbiAgICBhZGRJbml0aWFsUG9pbnRlck1vdmVMaXN0ZW5lcnMoKTtcblxuICAgIC8vIEZvciBmb2N1cyBhbmQgYmx1ciwgd2Ugc3BlY2lmaWNhbGx5IGNhcmUgYWJvdXQgc3RhdGUgY2hhbmdlcyBpbiB0aGUgbG9jYWxcbiAgICAvLyBzY29wZS4gVGhpcyBpcyBiZWNhdXNlIGZvY3VzIC8gYmx1ciBldmVudHMgdGhhdCBvcmlnaW5hdGUgZnJvbSB3aXRoaW4gYVxuICAgIC8vIHNoYWRvdyByb290IGFyZSBub3QgcmUtZGlzcGF0Y2hlZCBmcm9tIHRoZSBob3N0IGVsZW1lbnQgaWYgaXQgd2FzIGFscmVhZHlcbiAgICAvLyB0aGUgYWN0aXZlIGVsZW1lbnQgaW4gaXRzIG93biBzY29wZTpcbiAgICBzY29wZS5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIG9uRm9jdXMsIHRydWUpO1xuICAgIHNjb3BlLmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBvbkJsdXIsIHRydWUpO1xuXG4gICAgLy8gV2UgZGV0ZWN0IHRoYXQgYSBub2RlIGlzIGEgU2hhZG93Um9vdCBieSBlbnN1cmluZyB0aGF0IGl0IGlzIGFcbiAgICAvLyBEb2N1bWVudEZyYWdtZW50IGFuZCBhbHNvIGhhcyBhIGhvc3QgcHJvcGVydHkuIFRoaXMgY2hlY2sgY292ZXJzIG5hdGl2ZVxuICAgIC8vIGltcGxlbWVudGF0aW9uIGFuZCBwb2x5ZmlsbCBpbXBsZW1lbnRhdGlvbiB0cmFuc3BhcmVudGx5LiBJZiB3ZSBvbmx5IGNhcmVkXG4gICAgLy8gYWJvdXQgdGhlIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbiwgd2UgY291bGQganVzdCBjaGVjayBpZiB0aGUgc2NvcGUgd2FzXG4gICAgLy8gYW4gaW5zdGFuY2Ugb2YgYSBTaGFkb3dSb290LlxuICAgIGlmIChzY29wZS5ub2RlVHlwZSA9PT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFICYmIHNjb3BlLmhvc3QpIHtcbiAgICAgIC8vIFNpbmNlIGEgU2hhZG93Um9vdCBpcyBhIHNwZWNpYWwga2luZCBvZiBEb2N1bWVudEZyYWdtZW50LCBpdCBkb2VzIG5vdFxuICAgICAgLy8gaGF2ZSBhIHJvb3QgZWxlbWVudCB0byBhZGQgYSBjbGFzcyB0by4gU28sIHdlIGFkZCB0aGlzIGF0dHJpYnV0ZSB0byB0aGVcbiAgICAgIC8vIGhvc3QgZWxlbWVudCBpbnN0ZWFkOlxuICAgICAgc2NvcGUuaG9zdC5zZXRBdHRyaWJ1dGUoJ2RhdGEtanMtZm9jdXMtdmlzaWJsZScsICcnKTtcbiAgICB9IGVsc2UgaWYgKHNjb3BlLm5vZGVUeXBlID09PSBOb2RlLkRPQ1VNRU5UX05PREUpIHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdqcy1mb2N1cy12aXNpYmxlJyk7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLWpzLWZvY3VzLXZpc2libGUnLCAnJyk7XG4gICAgfVxuICB9XG5cbiAgLy8gSXQgaXMgaW1wb3J0YW50IHRvIHdyYXAgYWxsIHJlZmVyZW5jZXMgdG8gZ2xvYmFsIHdpbmRvdyBhbmQgZG9jdW1lbnQgaW5cbiAgLy8gdGhlc2UgY2hlY2tzIHRvIHN1cHBvcnQgc2VydmVyLXNpZGUgcmVuZGVyaW5nIHVzZSBjYXNlc1xuICAvLyBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL2ZvY3VzLXZpc2libGUvaXNzdWVzLzE5OVxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIE1ha2UgdGhlIHBvbHlmaWxsIGhlbHBlciBnbG9iYWxseSBhdmFpbGFibGUuIFRoaXMgY2FuIGJlIHVzZWQgYXMgYSBzaWduYWxcbiAgICAvLyB0byBpbnRlcmVzdGVkIGxpYnJhcmllcyB0aGF0IHdpc2ggdG8gY29vcmRpbmF0ZSB3aXRoIHRoZSBwb2x5ZmlsbCBmb3IgZS5nLixcbiAgICAvLyBhcHBseWluZyB0aGUgcG9seWZpbGwgdG8gYSBzaGFkb3cgcm9vdDpcbiAgICB3aW5kb3cuYXBwbHlGb2N1c1Zpc2libGVQb2x5ZmlsbCA9IGFwcGx5Rm9jdXNWaXNpYmxlUG9seWZpbGw7XG5cbiAgICAvLyBOb3RpZnkgaW50ZXJlc3RlZCBsaWJyYXJpZXMgb2YgdGhlIHBvbHlmaWxsJ3MgcHJlc2VuY2UsIGluIGNhc2UgdGhlXG4gICAgLy8gcG9seWZpbGwgd2FzIGxvYWRlZCBsYXppbHk6XG4gICAgdmFyIGV2ZW50O1xuXG4gICAgdHJ5IHtcbiAgICAgIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KCdmb2N1cy12aXNpYmxlLXBvbHlmaWxsLXJlYWR5Jyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIElFMTEgZG9lcyBub3Qgc3VwcG9ydCB1c2luZyBDdXN0b21FdmVudCBhcyBhIGNvbnN0cnVjdG9yIGRpcmVjdGx5OlxuICAgICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudCgnZm9jdXMtdmlzaWJsZS1wb2x5ZmlsbC1yZWFkeScsIGZhbHNlLCBmYWxzZSwge30pO1xuICAgIH1cblxuICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgLy8gQXBwbHkgdGhlIHBvbHlmaWxsIHRvIHRoZSBnbG9iYWwgZG9jdW1lbnQsIHNvIHRoYXQgbm8gSmF2YVNjcmlwdFxuICAgIC8vIGNvb3JkaW5hdGlvbiBpcyByZXF1aXJlZCB0byB1c2UgdGhlIHBvbHlmaWxsIGluIHRoZSB0b3AtbGV2ZWwgZG9jdW1lbnQ6XG4gICAgYXBwbHlGb2N1c1Zpc2libGVQb2x5ZmlsbChkb2N1bWVudCk7XG4gIH1cblxufSkpKTtcbiIsImNvbnN0IGJvZHkgPSBkb2N1bWVudC5ib2R5XG5jb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29udGFpbmVyJylcbmNvbnN0IGJ1cmdlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idXJnZXInKTtcbmNvbnN0IG5hdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZWFkZXJfX21lbnUtd3JhcCcpO1xuY29uc3QgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlYWRlcicpO1xuY29uc3QgY2hvaWNlc0xvY2F0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Nob2ljZXMtbG9jYXRpb24nKVxuXG4vL3Ntb290aCBzY3JvbGxcblxuY29uc3QgYW5jaG9ycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2FbaHJlZio9XCIjXCJdJyk7XG5cbmFuY2hvcnMuZm9yRWFjaChmdW5jdGlvbiAoYW5jaG9yKSB7XG4gIGFuY2hvci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICBjb25zdCBib2xja0lkID0gYW5jaG9yLmdldEF0dHJpYnV0ZSgnaHJlZicpLnN1YnN0cmluZygxKTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGJvbGNrSWQpLnNjcm9sbEludG9WaWV3KFxuICAgICAge1xuICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gICAgICAgIGJsb2NrOiAnc3RhcnQnLFxuICAgICAgfVxuICAgICk7XG4gIH0pO1xufSk7XG5cbi8vINGB0LXQu9C10LrRglxuXG5jb25zdCBjaG9pY2VzMSA9IG5ldyBDaG9pY2VzKGNob2ljZXNMb2NhdGlvbiwge1xuICBzZWFyY2hFbmFibGVkOiBmYWxzZSxcbiAgc2hvdWxkU29ydDogZmFsc2UsXG59KTtcblxuZnVuY3Rpb24gZHJvcGRvd25BY3QoY29udHJvbEJ0biwgZHJvcGRvd24pIHtcbiAgY29udHJvbEJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKVxuXG4gIGlmIChjb250cm9sQnRuLmNsYXNzTGlzdC5jb250YWlucygnaXMtYWN0aXZlJykpIHtcbiAgICBkcm9wZG93bi5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuZWQnKVxuICAgIGRyb3Bkb3duLnN0eWxlLm1heEhlaWdodCA9IGRyb3Bkb3duLnNjcm9sbEhlaWdodCArIFwicHhcIjtcbiAgfSBlbHNlIHtcbiAgICBkcm9wZG93bi5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJylcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGRyb3Bkb3duLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW5lZCcpO1xuICAgIH0sIDM1MCk7XG4gIH1cbn1cblxuLy8g0LTRgNC+0L/QtNCw0YPQvSBcItCa0LDRgtC10LPQvtGA0LjQuFwiXG5jb25zdCBjYXRlZ29yaWVzQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNhdGVnb3JpZXNfX2NvbnRyb2wnKTtcbmNvbnN0IGNhdGVnb3JpZXNEcm9wZG93biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXRlZ29yaWVzX19kcm9wZG93bicpO1xuXG5jYXRlZ29yaWVzQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+IHtcbiAgZHJvcGRvd25BY3QoY2F0ZWdvcmllc0J0biwgY2F0ZWdvcmllc0Ryb3Bkb3duKVxufSlcblxuXG4vLyDRgdCy0LDQudC/0LXRgCDRhdC40YDQvlxuXG5jb25zdCBoZXJvU3dpcGVyID0gbmV3IFN3aXBlcignLmhlcm8tc3dpcGVyJywge1xuICBkaXJlY3Rpb246ICdob3Jpem9udGFsJyxcbiAgc2xpZGVzUGVyVmlldzogMSxcbiAgbG9vcDogdHJ1ZSxcbiAgc3BhY2VCZXR3ZWVuOiAxMCxcbiAgcGFnaW5hdGlvbjoge1xuICAgIGVsOiAnLmhlcm8tc3dpcGVyX19wYWdpbmF0aW9uJyxcbiAgICB0eXBlOiAnYnVsbGV0cycsXG4gICAgY2xpY2thYmxlOiB0cnVlLFxuICB9LFxuXG4gIGExMXk6IHtcbiAgcHJldlNsaWRlTWVzc2FnZTogJ9Cf0YDQtdC00YvQtNGD0YnQuNC5INGB0LvQsNC50LQnLFxuICBuZXh0U2xpZGVNZXNzYWdlOiAn0KHQu9C10LTRg9GO0YnQuNC5INGB0LvQsNC50LQnLFxuICB9LFxuICBrZXlib2FyZDogdHJ1ZSxcblxufSk7XG5cbi8vINGB0LLQsNC50L/QtdGAINGB0L/QtdGG0L/RgNC10LTQu9C+0LbQtdC90LjQuVxuXG5jb25zdCBzcGVjU3dpcGVyID0gbmV3IFN3aXBlcignLnNwZWNpYWwtc3dpcGVyJywge1xuICBzbGlkZXNQZXJWaWV3OiAnYXV0bycsXG4gIG5hdmlnYXRpb246IHtcbiAgICBuZXh0RWw6ICcuc3BlY2lhbF9fc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICBwcmV2RWw6ICcuc3BlY2lhbF9fc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgfSxcbiAgYnJlYWtwb2ludHM6IHtcbiAgICA1ODQ6IHtcbiAgICAgIHNsaWRlc1Blckdyb3VwOiAyLFxuICAgIH0sXG4gICAgMTAwMDoge1xuICAgICAgc2xpZGVzUGVyR3JvdXA6IDMsXG4gICAgfSxcbiAgfSxcbiAgYTExeToge1xuICAgIHByZXZTbGlkZU1lc3NhZ2U6ICfQn9GA0LXQtNGL0LTRg9GJ0LjQtSDRgdC70LDQudC00YsnLFxuICAgIG5leHRTbGlkZU1lc3NhZ2U6ICfQodC70LXQtNGD0Y7RidC40LUg0YHQu9Cw0LnQtNGLJyxcbiAgfSxcbiAga2V5Ym9hcmQ6IHRydWUsXG59KTtcblxuLy8g0YHQstCw0LnQv9C10YAg0YHQtdC60YbQuNC4IFwi0J/QvtC70LXQt9C90L7QtVwiXG5cbmNvbnN0IHVzZWZ1bFN3aXBlciA9IG5ldyBTd2lwZXIoJy51c2VmdWwtc3dpcGVyJywge1xuICBkaXJlY3Rpb246ICdob3Jpem9udGFsJyxcbiAgc2xpZGVzUGVyVmlldzogMSxcbiAgc2xpZGVzUGVyR3JvdXA6IDEsXG4gIHNwYWNlQmV0d2VlbjogMTIsXG4gIHNsaWRlQ2xhc3M6ICd1c2VmdWwtc3dpcGVyX19zbGlkZScsXG4gIG5hdmlnYXRpb246IHtcbiAgICBuZXh0RWw6ICcudXNlZnVsX19zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgIHByZXZFbDogJy51c2VmdWxfX3N3aXBlci1idXR0b24tcHJldicsXG4gIH0sXG4gIGJyZWFrcG9pbnRzOiB7XG4gICAgNTgxOiB7XG4gICAgICBzbGlkZXNQZXJWaWV3OiAyLFxuICAgICAgc2xpZGVzUGVyR3JvdXA6IDIsXG4gICAgICBzcGFjZUJldHdlZW46IDMyLFxuICAgIH0sXG4gICAgMTAyNDoge1xuICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgIHNsaWRlc1Blckdyb3VwOiAzLFxuICAgICAgc3BhY2VCZXR3ZWVuOiAzMixcbiAgICB9LFxuICAgIDEyMzA6IHtcbiAgICAgIHNsaWRlc1BlclZpZXc6IDIsXG4gICAgICBzbGlkZXNQZXJHcm91cDogMixcbiAgICAgIHNwYWNlQmV0d2VlbjogMzIsXG4gICAgfSxcbiAgfSxcbiAgYTExeToge1xuICAgIHByZXZTbGlkZU1lc3NhZ2U6ICfQn9GA0LXQtNGL0LTRg9GJ0LjQtSDRgdC70LDQudC00YsnLFxuICAgIG5leHRTbGlkZU1lc3NhZ2U6ICfQodC70LXQtNGD0Y7RidC40LUg0YHQu9Cw0LnQtNGLJyxcbiAgfSxcbiAga2V5Ym9hcmQ6IHRydWUsXG59KTtcblxuLy8g0YDQsNGB0YfRkdGCINGI0LjRgNC40L3RiyDQuCDQv9C+0LfQuNGG0LjQuCDRgdC10YDQvtCz0L4g0YTQvtC90LAg0YXRjdC00Y3RgNCwXG5cbmNvbnN0IHBzZXVkbyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJzpyb290JylcblxuZnVuY3Rpb24gY2FsY1N0cmlwZSgpIHtcbiAgcHNldWRvLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKVxuICBsZXQgc3RyaXBlU2hpZnQgPSAoY29udGFpbmVyLm9mZnNldFdpZHRoIC0gYm9keS5vZmZzZXRXaWR0aCkgLyAyXG4gIHBzZXVkby5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1zdHJpcGUtc2hpZnQnLCBgJHtzdHJpcGVTaGlmdH1weGApXG4gIHBzZXVkby5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1zdHJpcGUtd2lkdGgnLCBgJHtib2R5Lm9mZnNldFdpZHRofXB4YClcbn1cblxuY2FsY1N0cmlwZSgpXG5cbi8vINGA0LDRgdGH0ZHRgiDQutC+0Lst0LLQsCDQvtGC0L7QsdGA0LDQttCw0LXQvNGL0YUg0LrQsNGA0YLQvtGH0LXQuiBcItCy0YvRgdC+0LrQvtCz0L4g0YDQtdC50YLQuNC90LPQsFwiXG5jb25zdCBnb29kc0NhcmRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJhdGVkX19saXN0LWl0ZW0nKTtcbmNvbnN0IHJhdGVCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmF0ZWRfX2J0bicpO1xubGV0IHBhZ2VXaWR0aCA9IGJvZHkub2Zmc2V0V2lkdGhcbmxldCBnb29kc051bWJlciA9IChwYWdlV2lkdGggPCAxMjAwKSA/IDYgOiA4O1xubGV0IGFjdHVhbGdvb2RzTnVtYmVyID0gZ29vZHNOdW1iZXI7XG5zd2l0Y2hDYXJkcyhhY3R1YWxnb29kc051bWJlcilcblxuXG4vLyDQsdGD0YDQs9C10YAg0Lgg0LzQtdC90Y4g0L3QsNCy0LjQs9Cw0YbQuNC4XG5cbmJ1cmdlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgZHJvcGRvd25BY3QoYnVyZ2VyLCBuYXYpXG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGlmIChuYXYuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkge1xuICAgICAgYWRhcHRIZWFkZXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzZXRIZWFkZXIoKTtcbiAgICB9XG4gIH0sIDEwKTtcblxufSk7XG5cbmZ1bmN0aW9uIHJlc2V0SGVhZGVyKCkge1xuICBoZWFkZXIucmVtb3ZlQXR0cmlidXRlKFwic3R5bGVcIik7XG4gIHVuYmxvY2tTY3JvbGwoKTtcbn1cblxuZnVuY3Rpb24gYWRhcHRIZWFkZXIoKSB7XG4gIGNvbnN0IHBhZGRpbmdPZmZzZXQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIGJvZHkub2Zmc2V0V2lkdGggKyAncHgnO1xuICBibG9ja1Njcm9sbCgpO1xuICBoZWFkZXIuc3R5bGUucGFkZGluZ1JpZ2h0ID0gcGFkZGluZ09mZnNldDtcbn1cblxuZnVuY3Rpb24gYmxvY2tTY3JvbGwoKSB7XG4gIGNvbnN0IHBhZGRpbmdPZmZzZXQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIGJvZHkub2Zmc2V0V2lkdGggKyAncHgnO1xuICBib2R5LmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuICBib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9IHBhZGRpbmdPZmZzZXQ7XG59XG5cbmZ1bmN0aW9uIHVuYmxvY2tTY3JvbGwoKSB7XG4gIGJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gIGJvZHkucmVtb3ZlQXR0cmlidXRlKFwic3R5bGVcIik7XG59XG5cbm5hdi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICBpZiAoKGV2ZW50LnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ25hdmlnYXRpb25fX2xpbmsnKSkgJiYgIGJ1cmdlci5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLWFjdGl2ZScpKSB7XG4gICAgdG9nZ2xlQnVyZ2VyQW5kTWVudSgpO1xuICAgIHJlc2V0SGVhZGVyKCk7XG4gIH1cbn0pO1xuXG4vLyDQodCe0JHQq9Ci0JjQryDQn9Cg0Jgg0KDQldCh0JDQmdCX0JVcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICgpID0+IHtcblxuICBjYWxjU3RyaXBlKClcblxuICBwYWdlV2lkdGggPSBib2R5Lm9mZnNldFdpZHRoXG4gIC8vINC/0LXRgNC10LrQu9GO0YfQtdC90LjQtSDQutC+0Lst0LLQsCDQvtGC0L7QsdGA0LDQttCw0LXQvNGL0YUg0LrQsNGA0YLQvtGH0LXQuiBcItCy0YvRgdC+0LrQvtCz0L4g0YDQtdC50YLQuNC90LPQsFwiXG4gIGlmICghcmF0ZUJ0bi5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpKSB7XG4gICAgZ29vZHNOdW1iZXIgPSAocGFnZVdpZHRoIDwgMTIwMCkgPyA2IDogODtcbiAgICBpZiAoZ29vZHNOdW1iZXIgIT0gYWN0dWFsZ29vZHNOdW1iZXIpIHtcbiAgICAgIGFjdHVhbGdvb2RzTnVtYmVyID0gZ29vZHNOdW1iZXI7XG4gICAgICBzd2l0Y2hDYXJkcyhhY3R1YWxnb29kc051bWJlcilcbiAgICB9XG4gIH1cblxuICAvLyDRgdCx0YDQvtGBINC+0YLRgNGL0YLQvtCz0L4g0LzQtdC90Y4g0L/RgNC4INGA0LXRgdCw0LnQt9C1XG4gIGlmICgod2luZG93LmlubmVyV2lkdGggPiAxMDAwKSAmJiBuYXYuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1hY3RpdmUnKSkge1xuICAgIHRvZ2dsZUJ1cmdlckFuZE1lbnUoKTtcbiAgICByZXNldEhlYWRlcigpO1xuICB9XG59KTtcblxuZnVuY3Rpb24gc3dpdGNoQ2FyZHMod2FudGVkTnVtKSB7XG5cbiAgaWYgKHdhbnRlZE51bSA9PSA4KSB7XG4gICAgZm9yIChsZXQgaSA9IDY7IGkgPCA4OyBpKyspIHtcbiAgICAgIGlmIChnb29kc0NhcmRzW2ldLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykpIHtcbiAgICAgICAgZGlzcGxheUJsb2NrKGdvb2RzQ2FyZHNbaV0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IHdhbnRlZE51bTsgaSA8PSBnb29kc0NhcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGdvb2RzQ2FyZHNbaV0pIHtcbiAgICAgIGlmICghZ29vZHNDYXJkc1tpXS5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpKSB7XG4gICAgICAgIHJlbW92ZUJsb2NrKGdvb2RzQ2FyZHNbaV0pXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlCbG9jayhibG9jaykge1xuICBibG9jay5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxufVxuZnVuY3Rpb24gcmVtb3ZlQmxvY2soYmxvY2spIHtcbiAgYmxvY2suY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbn1cblxuLy8g0L/QvtC60LDQt9Cw0YLRjCArNCDQutCw0YDRgtC+0YfQutC4INGC0L7QstCw0YDQsFxuXG5sZXQgYnRuU2hvd01vcmVMaXN0ZW5lciA9IGZ1bmN0aW9uKCkge1xuICBmb3IgKGxldCBpID0gMTsgaSA8IDU7IGkrKykge1xuICAgIGxldCBjYXJkVG9TaG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJhdGVkX19saXN0LWl0ZW0uaGlkZGVuJylcbiAgICBpZiAoY2FyZFRvU2hvdykge1xuICAgICAgZGlzcGxheUJsb2NrKGNhcmRUb1Nob3cpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJhdGVCdG4ucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBidG5TaG93TW9yZUxpc3RlbmVyKVxuICAgICAgcmVtb3ZlQmxvY2socmF0ZUJ0bilcbiAgICB9XG4gIH1cbn1cblxucmF0ZUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGJ0blNob3dNb3JlTGlzdGVuZXIpXG5cbi8vINC/0L7QutCw0LfQsNGC0Ywg0YLRg9C70YLQuNC/XG5cbmNvbnN0IHRpcHB5QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haWwtdXNfX3RpcC1idG4nKVxuXG50aXBweUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpPT4ge1xuICB0aXBweUJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdpcy1hY3RpdmUnKVxufSlcblxuLy/QvdCw0YHRgtGA0L7QudC60Lgg0YLQuNC/0L/QuC3Qv9C+0LTRgdC60LDQt9C60LhcbnRpcHB5KCcubWFpbC11c19fdGlwLWJ0bicsIHtcbiAgdHJpZ2dlcjogJ2NsaWNrJyxcbiAgbWF4V2lkdGg6IDE1NyxcbiAgY29udGVudDogJ9Cg0LXQv9C70LjRhtC40YDQvtCy0LDQvdC90YvQtSDRgSDQt9Cw0YDRg9Cx0LXQttC90YvRhSDQuNGB0YLQvtGH0L3QuNC60L7Qsiwg0LjRgdGB0LvQtdC00L7QstCw0L3QuNGPINGE0L7RgNC80LjRgNGD0Y7RgiDQs9C70L7QsdCw0LvRjNC90YPRjiDRgdC10YLRjC4nLFxufSk7XG5cbi8v0LjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0LzQsNGB0LrQuCDQuNC90L/Rg9GC0LAg0YLQtdC70LXRhNC+0L3QsFxuXG5cbi8vINC90LDRgdGC0YDQvtC50LrQsCDQstCw0LvQuNC00LDRhtC40Lgg0YTQvtGA0LzRi1xuXG5jb25zdCB2YWxpZExldHRlcnNSdSA9IC9eW9CQLdCv0LAt0Y9dKyQvO1xuY29uc3QgdmFsaWRMZXR0ZXJzRW4gPSAvXltBLVphLXpdKyQvO1xuXG5jb25zdCBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1haWwtdXMtZm9ybScpO1xuY29uc3QgcGhvbmVJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwaG9uZScpO1xuY29uc3QgbmFtZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25hbWUnKTtcblxuSW5wdXRtYXNrKFwiKzcoOTk5KS05OTktOTktOTlcIikubWFzayhwaG9uZUlucHV0KTtcblxuY29uc3QgdmFsaWRhdGlvbiA9IG5ldyB3aW5kb3cuSnVzdFZhbGlkYXRlKGZvcm0sIHtcbiAgZm9jdXNJbnZhbGlkRmllbGQ6IHRydWUsXG4gIHN1Y2Nlc3NGaWVsZENzc0NsYXNzOiAndmFsaWQtZmllbGQnLFxuICBlcnJvckZpZWxkQ3NzQ2xhc3M6ICdpbnZhbGlkLWZpZWxkJyxcbn0pXG5cbnZhbGlkYXRpb25cbi5hZGRGaWVsZCgnI25hbWUnLCBbXG4gIHtcbiAgICBydWxlOiAnbWluTGVuZ3RoJyxcbiAgICB2YWx1ZTogMyxcbiAgICBlcnJvck1lc3NhZ2U6ICfQktCy0LXQtNC40YLQtSDQvNC40L3QuNC80YPQvCAzINGB0LjQvNCy0L7Qu9CwJyxcbiAgfSxcbiAge1xuICAgIHJ1bGU6ICdtYXhMZW5ndGgnLFxuICAgIHZhbHVlOiAyNSxcbiAgICBlcnJvck1lc3NhZ2U6ICAn0JLQstC10LTQuNGC0LUg0L3QtSDQsdC+0LvQtdC1IDI1INGB0LjQvNCy0L7Qu9C+0LInLFxuICB9LFxuICB7XG4gICAgcnVsZTogJ3JlcXVpcmVkJyxcbiAgICB2YWx1ZTogdHJ1ZSxcbiAgICBlcnJvck1lc3NhZ2U6ICfQmtCw0Log0LLQsNGBINC30L7QstGD0YI/J1xuICB9LFxuICB7XG4gICAgcnVsZTogJ2Z1bmN0aW9uJyxcbiAgICAgIHZhbGlkYXRvcigpIHtcbiAgICAgIGNvbnN0IHVzZXJOYW1lID0gbmFtZUlucHV0LnZhbHVlO1xuICAgICAgaWYgKHVzZXJOYW1lLm1hdGNoKHZhbGlkTGV0dGVyc1J1KXx8dXNlck5hbWUubWF0Y2godmFsaWRMZXR0ZXJzRW4pKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuICAgIGVycm9yTWVzc2FnZTogJ9CU0L7Qv9GD0YHRgtC40LzRiyDRgtC+0LvRjNC60L4g0LHRg9C60LLRiyDQutC40YDQuNC70LvQuNGG0Ysg0LjQu9C4INC70LDRgtGL0L3QuCcsXG4gIH1cbl0pXG4uYWRkRmllbGQoJyNlbWFpbCcsIFtcbiAge1xuICAgIHJ1bGU6ICdyZXF1aXJlZCcsXG4gICAgdmFsdWU6IHRydWUsXG4gICAgZXJyb3JNZXNzYWdlOiAn0KPQutCw0LbQuNGC0LUg0LLQsNGI0YMg0L/QvtGH0YLRgycsXG4gIH0sXG4gIHtcbiAgICBydWxlOiAnZW1haWwnLFxuICAgIHZhbHVlOiB0cnVlLFxuICAgIGVycm9yTWVzc2FnZTogJ9CS0LLQtdC00LjRgtC1INC60L7RgNGA0LXQutGC0L3Ri9C5IGUtbWFpbCcsXG4gIH0sXG5dKVxuLmFkZEZpZWxkKCcjcGhvbmUnLCBbXG4gIHtcbiAgICBydWxlOiAncmVxdWlyZWQnLFxuICAgIHZhbHVlOiB0cnVlLFxuICAgIGVycm9yTWVzc2FnZTogJ9Cj0LrQsNC20LjRgtC1INCy0LDRiCDRgtC10LvQtdGE0L7QvScsXG4gIH0sXG4gIHtcbiAgICBydWxlOiAnZnVuY3Rpb24nLFxuICAgIHZhbGlkYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBwaG9uZSA9IHBob25lSW5wdXQuaW5wdXRtYXNrLnVubWFza2VkdmFsdWUoKTtcbiAgICAgIHJldHVybiBwaG9uZS5sZW5ndGggPT09IDEwO1xuICAgIH0sXG4gICAgZXJyb3JNZXNzYWdlOiAn0JLQstC10LTQuNGC0LUg0LrQvtGA0YDQtdC60YLQvdGL0Lkg0YLQtdC70LXRhNC+0L0nLFxuICB9LFxuXSlcbi5hZGRGaWVsZCgnI2NoZWNrJywgW1xuICB7XG4gICAgcnVsZTogJ3JlcXVpcmVkJyxcbiAgICB2YWx1ZTogdHJ1ZSxcbiAgICBlcnJvck1lc3NhZ2U6ICfQndC10L7QsdGF0L7QtNC40LzQviDQv9C+0LTRgtCy0LXRgNC00LjRgtGMJyxcbiAgfSxcbl0pXG4ub25TdWNjZXNzKChldmVudCkgPT4ge1xuICBjb25zb2xlLmxvZygnVmFsaWRhdGlvbiBwYXNzZXMgYW5kIGZvcm0gc3VibWl0dGVkJywgZXZlbnQpO1xuXG4gIGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShldmVudC50YXJnZXQpO1xuXG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICBjb25zb2xlLmxvZygn0J7RgtC/0YDQsNCy0LvQtdC90L4nKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB4aHIub3BlbignUE9TVCcsICdtYWlsLnBocCcsIHRydWUpO1xuICB4aHIuc2VuZChmb3JtRGF0YSk7XG5cbiAgZXZlbnQudGFyZ2V0LnJlc2V0KCk7XG59KTtcblxuIl19
