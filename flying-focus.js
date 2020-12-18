"use strict";

// This is a modified version of the code in https://github.com/NV/flying-focus that was released under this MIT license:

/**
 * Copyright (c) Nikita Vasilyev
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function setUpFlyingFocusRing() {
  var DURATION_IN_MS = 400;

  var flyingRingElement = null;
  var timer = null;
  var previouslyFocusedElement = null;
  var keyDownTime = 0;

  addStyleSheet();

  document.documentElement.addEventListener(
    "keydown",
    function setKeyDownTime(event) {
      var code = event.which || event.keyCode;
      var hitTab = code === 9;
      var hitArrowKeys = code > 36 && code < 41;
      if (hitTab || hitArrowKeys) {
        keyDownTime = Date.now();
      }
    },
    false // bubble up
  );

  document.documentElement.addEventListener(
    "focus",
    function moveFocusRing(event) {
      var target = event.target;
      if (target.id === "flying-focus-ring-element") return;

      var isFirstFocus = false;
      if (!flyingRingElement) {
        isFirstFocus = true;
        initialize();
      }

      var offset = offsetOf(target);
      flyingRingElement.style.left = offset.left + "px";
      flyingRingElement.style.top = offset.top + "px";
      flyingRingElement.style.width = target.offsetWidth + "px";
      flyingRingElement.style.height = target.offsetHeight + "px";

      if (isFirstFocus || !wasRecentlyPressed()) return;

      cleanUpFlyingFocus();
      target.classList.add("flying-focus_target");
      flyingRingElement.classList.add("flying-focus_visible");
      previouslyFocusedElement = target;
      timer = setTimeout(cleanUpFlyingFocus, DURATION_IN_MS);
    },
    true // bubble down
  );

  document.documentElement.addEventListener(
    "blur",
    function doneFlyingFocusAnimation() {
      cleanUpFlyingFocus();
    },
    true // bubble down
  );

  function initialize() {
    flyingRingElement = document.createElement("div");
    flyingRingElement.id = "flying-focus-ring-element";
    flyingRingElement.style.transitionDuration = flyingRingElement.style.WebkitTransitionDuration =
      DURATION_IN_MS / 1000 + "s";
    document.body.appendChild(flyingRingElement);
  }

  function cleanUpFlyingFocus() {
    if (!timer) return;
    clearTimeout(timer);
    timer = null;
    flyingRingElement.classList.remove("flying-focus_visible");
    previouslyFocusedElement.classList.remove("flying-focus_target");
    previouslyFocusedElement = null;
  }

  function wasRecentlyPressed() {
    var millisecondsToCountAsRecent = 42;
    return Date.now() - keyDownTime < millisecondsToCountAsRecent;
  }

  function offsetOf(elem) {
    var rect = elem.getBoundingClientRect();
    var clientLeft =
      document.documentElement.clientLeft || document.body.clientLeft;
    var clientTop =
      document.documentElement.clientTop || document.body.clientTop;
    var scrollLeft =
      window.pageXOffset ||
      document.documentElement.scrollLeft ||
      document.body.scrollLeft;
    var scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    var left = rect.left + scrollLeft - clientLeft;
    var top = rect.top + scrollTop - clientTop;
    return {
      top: top || 0,
      left: left || 0,
    };
  }

  function addStyleSheet() {
    var styles = `
      #flying-focus-ring-element {
        position: absolute;
        background: transparent;
        /* -webkit-transition-property: left, top, width, height; */
        transition-property: left, top, width, height;
        /* -webkit-transition-timing-function: cubic-bezier(0,1,0,1); */
        transition-timing-function: cubic-bezier(0,1,0,1);
        visibility: hidden;
        pointer-events: none;
        box-shadow: 0 0 2px 3px lightblue, 0 0 2px lightblue inset;
        border-radius: 2px;
      }
      #flying-focus-ring-element.flying-focus_visible {
        visibility: visible;
        z-index: 9999;
      }
      #flying-focus-ring-element:not(.flying-focus_visible) {
        height: 0 !important;
      }
      @media (prefers-reduced-motion) {
        #flying-focus-ring-element {
          display: none;
        }
      }
    `;

    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.className = "flying-focus-ring-style-sheet";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }
})();
