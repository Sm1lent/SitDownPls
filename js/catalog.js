"use strict";function _createForOfIteratorHelper(e,t){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=_unsupportedIterableToArray(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,o=function(){};return{s:o,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,c=!0,a=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return c=e.done,e},e:function(e){a=!0,i=e},f:function(){try{c||null==r.return||r.return()}finally{if(a)throw i}}}}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var body=document.body,container=document.querySelector(".container"),burger=document.querySelector(".burger"),nav=document.querySelector(".header__menu-wrap"),header=document.querySelector(".header"),choicesLocation=document.querySelector("#choices-location"),categoriesBtn=document.querySelector(".categories__control"),categoriesDropdown=document.querySelector(".categories__dropdown"),categoriesList=document.querySelector(".categories__list"),rangeSlider=document.querySelector(".wrapper__slider"),minPriceInput=document.querySelector(".range-wrapper__field_first"),maxPriceInput=document.querySelector(".range-wrapper__field_second"),priceInputs=[minPriceInput,maxPriceInput],filters=document.querySelectorAll(".filter-block__filter-title"),sofaCards=document.querySelectorAll(".catalog__slide"),colorFilters=document.querySelectorAll(".filter-block__dropdown_color .filter-block__check"),FILTER_ACTIVATING_WIDTH=1230;function getWindowWidth(){return Math.max(document.body.scrollWidth,document.documentElement.scrollWidth,document.body.offsetWidth,document.documentElement.offsetWidth,document.body.clientWidth,document.documentElement.clientWidth)}var anchors=document.querySelectorAll('a[href*="#"]');anchors.forEach((function(e){e.addEventListener("click",(function(t){t.preventDefault();var r=e.getAttribute("href").substring(1),n=document.getElementById(r);n&&n.scrollIntoView({behavior:"smooth",block:"start"})}))}));var choices1=new Choices(choicesLocation,{searchEnabled:!1,shouldSort:!1});function dropdownAct(e,t){e.classList.toggle("is-active"),e.classList.contains("is-active")?showDropdown(t):hideDropdown(t)}function showDropdown(e){e.classList.add("is-opened"),e.style.maxHeight=e.scrollHeight+"px"}function hideDropdown(e){e.removeAttribute("style"),setTimeout((function(){e.classList.remove("is-opened")}),350)}categoriesBtn.addEventListener("click",(function(){categoriesBtn.classList.toggle("is-active"),categoriesBtn.classList.contains("is-active")?(showDropdown(categoriesDropdown),body.addEventListener("click",dropdownListener)):hideDropdown(categoriesDropdown)}));var dropdownListener=function e(t){t.target!=categoriesList&&t.target!=categoriesBtn&&(hideDropdown(categoriesDropdown),categoriesBtn.classList.remove("is-active"),body.removeEventListener("click",e))},pseudo=document.querySelector(":root");function calcStripe(){pseudo.removeAttribute("style");var e=(container.offsetWidth-body.offsetWidth)/2;pseudo.style.setProperty("--stripe-shift","".concat(e,"px")),pseudo.style.setProperty("--stripe-width","".concat(body.offsetWidth,"px"))}calcStripe();var goodsCards=document.querySelectorAll(".rated__list-item"),rateBtn=document.querySelector(".rated__btn"),pageWidth=body.offsetWidth;burger.addEventListener("click",(function(){dropdownAct(burger,nav)})),nav.addEventListener("click",(function(e){(e.target.classList.contains("menu__link")||e.target.classList.contains("sec-menu__link"))&&burger.classList.contains("is-active")&&dropdownAct(burger,nav)})),window.addEventListener("resize",(function(){calcStripe(),window.innerWidth>1e3&&nav.classList.contains("is-active")&&(toggleBurgerAndMenu(),resetHeader()),getWindowWidth()<=FILTER_ACTIVATING_WIDTH?setTabIndexes(filters):(removeTabIndexes(filters),filters.forEach((function(e){var t;t="Цена"===e.textContent?document.querySelector(".catalog__price-slider"):e.nextElementSibling,e.classList.remove("is-active"),t.classList.remove("is-opened")})))})),body.addEventListener("click",(function(e){if(!(e.target.classList.contains("filter-block__filter-title")||e.target.classList.contains("filter-block__check")||e.target.classList.contains("filter-block__label")||e.target.classList.contains("range-wrapper__text")||e.target.classList.contains("range-wrapper__field"))){var t=document.querySelector(".filter-block .is-opened"),r=document.querySelector(".filter-block .is-active");r&&(r.classList.remove("is-active"),hideDropdown(t))}}));var catalogSwiper=new Swiper(".catalog__swiper",{direction:"horizontal",slideClass:"swiper-slide",slidesPerView:2,slidesPerGroup:2,spaceBetween:16,grid:{rows:3,fill:"row"},pagination:{el:".catalog__swiper-pagination",type:"bullets",clickable:!0},breakpoints:{583:{spaceBetween:32},1e3:{slidesPerView:3,slidesPerGroup:3,spaceBetween:32}},a11y:{prevSlideMessage:"Предыдущие слайды",nextSlideMessage:"Следующие слайды"},keyboard:!0,watchSlidesProgress:!0,watchSlidesVisibility:!0,slideVisibleClass:"slide-visible",on:{init:function(){this.slides.forEach((function(e){e.classList.contains("slide-visible")?e.tabIndex="":e.tabIndex="-1"}))},slideChange:function(){this.slides.forEach((function(e){e.classList.contains("slide-visible")?e.tabIndex="":e.tabIndex="-1"}))}}});function filterByPrice(){var e,t=minPriceInput.value,r=maxPriceInput.value,n=_createForOfIteratorHelper(filterByColors(getColors()));try{for(n.s();!(e=n.n()).done;){var o=e.value,i=extractItemPrice(o);i>=t&&i<=r&&(o.classList.add("swiper-slide"),o.classList.remove("display-none","swiper-slide-active"))}}catch(e){n.e(e)}finally{n.f()}}function extractItemPrice(e){var t=e.querySelector(".item__price").textContent,r=t.length-3;return Number(t.slice(0,r).replace(/\s+/g,""))}function getColors(){var e,t=[],r=_createForOfIteratorHelper(document.querySelectorAll(".filter-block__dropdown_color .filter-block__check:checked"));try{for(r.s();!(e=r.n()).done;){var n=e.value;t.push(n.dataset.color)}}catch(e){r.e(e)}finally{r.f()}return t}function filterByColors(e){var t,r=[],n=_createForOfIteratorHelper(sofaCards);try{for(n.s();!(t=n.n()).done;){var o=t.value;o.classList.remove("swiper-slide"),o.classList.add("display-none");var i,c=_createForOfIteratorHelper(e);try{for(c.s();!(i=c.n()).done;){var a=i.value;o.dataset.color===a&&r.push(o)}}catch(e){c.e(e)}finally{c.f()}}}catch(e){n.e(e)}finally{n.f()}return r}if(colorFilters.forEach((function(e){e.addEventListener("input",(function(){setTimeout((function(){filterByPrice(),catalogSwiper.update()}),255)}))})),minPriceInput.addEventListener("input",(function(){setTimeout((function(){filterByPrice(),catalogSwiper.update()}),250)})),maxPriceInput.addEventListener("input",(function(){setTimeout((function(){filterByPrice(),catalogSwiper.update()}),250)})),rangeSlider){noUiSlider.create(rangeSlider,{start:[17e3,15e4],connect:!0,step:1e3,range:{min:0,max:22e4}}),rangeSlider.noUiSlider.on("update",(function(e,t){priceInputs[t].value=Math.round(e[t]),setTimeout((function(){filterByPrice(),catalogSwiper.update()}),250)}));var setRangeSlider=function(e,t){var r=[null,null];r[e]=t,rangeSlider.noUiSlider.set(r)};priceInputs.forEach((function(e,t){e.addEventListener("change",(function(e){setRangeSlider(t,e.currentTarget.value)}))}))}function setTabIndexes(e){e.forEach((function(e){e.setAttribute("tabindex","0")}))}function removeTabIndexes(e){e.forEach((function(e){e.removeAttribute("tabindex")}))}setTabIndexes(filters),filters.forEach((function(e){var t;t="Цена"===e.textContent?document.querySelector(".catalog__price-slider"):e.nextElementSibling,e.addEventListener("click",(function(){if(getWindowWidth()<=FILTER_ACTIVATING_WIDTH){var r=document.querySelector(".filter-block .is-opened"),n=document.querySelector(".filter-block .is-active");n&&n!==e&&(n.classList.remove("is-active"),hideDropdown(r)),dropdownAct(e,t)}}))}));