/* toast.js — confirmation pill. Usage: APP.toast("Saved ✓") */
window.APP = window.APP || {};

(function () {
  let timer;
  APP.toast = function (msg) {
    const el = APP.$("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("show"), 1900);
  };
})();
