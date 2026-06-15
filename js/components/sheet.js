/* sheet.js — bottom sheet + overlay. APP.sheet.open(html) / .close() */
window.APP = window.APP || {};

APP.sheet = {
  open(html) {
    APP.$("sheet").innerHTML = `<div class="grab"></div>` + html;
    APP.$("overlay").classList.add("show");
    APP.$("sheet").classList.add("show");
  },
  close() {
    APP.$("overlay").classList.remove("show");
    APP.$("sheet").classList.remove("show");
  },
};
