const items = document.querySelectorAll(".item");
const tray = document.getElementById("tray");
const score = document.getElementById("score");

let drag = null;
let offsetX = 0;
let offsetY = 0;

let count = 0;

items.forEach(item => {
  item.addEventListener("mousedown", e => {
    drag = item;

    const r = item.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;

    document.body.appendChild(item);

    item.style.position = "absolute";
    item.style.zIndex = 999;
  });
});

window.addEventListener("mousemove", e => {
  if (!drag) return;

  drag.style.left = (e.pageX - offsetX) + "px";
  drag.style.top = (e.pageY - offsetY) + "px";
});

window.addEventListener("mouseup", () => {
  if (!drag) return;

  const item = drag;
  drag = null;

  const trayRect = tray.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();

  const inTray =
    itemRect.left > trayRect.left &&
    itemRect.right < trayRect.right &&
    itemRect.top > trayRect.top &&
    itemRect.bottom < trayRect.bottom;

  if (inTray) {
    tray.appendChild(item);
    item.style.position = "relative";
    item.style.left = "0";
    item.style.top = "0";

    count++;
    score.textContent = `${count}/8`;
  } else {
    item.style.position = "relative";
    item.style.left = "";
    item.style.top = "";
  }
});