// a dropdown that shows name, party and a wikipedia link for each person (a plain <select> can't).
// the person already picked in the other dropdown is greyed out, so you can't pick the same one twice.

import { h } from "./dom.js";

export function createPicker(label, people, onChange) {
  let value = null;
  let blockedId = null;
  let open = false;

  const labelEl = h("span", { class: "pick-label" }, "select");
  const btn = h(
    "button",
    { type: "button", class: "pick-btn", "aria-haspopup": "listbox", "aria-expanded": "false", "aria-label": label },
    labelEl,
    h("span", { class: "pick-caret", "aria-hidden": "true" }, "▾")
  );

  const items = people.map((p) => {
    const li = h(
      "li",
      { role: "option", tabindex: "-1", class: "pick-item", "data-id": p.id, "aria-selected": "false" },
      h("span", { class: "pick-name" }, p.name),
      h("span", { class: `pick-party party-${p.party}` }, p.party),
      h(
        "a",
        {
          class: "pick-wiki",
          href: p.wiki,
          target: "_blank",
          rel: "noopener noreferrer",
          title: `${p.name} on wikipedia`,
          onclick: (e) => e.stopPropagation(), // following the link must not pick the person
        },
        "wikipedia ↗"
      )
    );
    li.addEventListener("click", () => choose(p.id));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        choose(p.id);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        focusStep(li, 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusStep(li, -1);
      }
    });
    return li;
  });

  const list = h("ul", { class: "pick-list", role: "listbox", tabindex: "-1" }, ...items);
  list.hidden = true;
  const root = h("div", { class: "picker" }, btn, list);

  function focusStep(from, dir) {
    const enabled = items.filter((li) => li.getAttribute("aria-disabled") !== "true");
    const i = enabled.indexOf(from);
    enabled[(i + dir + enabled.length) % enabled.length]?.focus();
  }

  function setOpen(next) {
    open = next;
    list.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open) (items.find((li) => li.getAttribute("aria-selected") === "true") ?? items.find((li) => li.getAttribute("aria-disabled") !== "true"))?.focus();
  }

  function choose(id) {
    if (id === blockedId) return;
    value = id;
    const p = people.find((x) => x.id === id);
    labelEl.textContent = p.name;
    btn.classList.add("has-value");
    items.forEach((li) => li.setAttribute("aria-selected", String(li.dataset.id === id)));
    setOpen(false);
    btn.focus();
    onChange(value);
  }

  btn.addEventListener("click", () => setOpen(!open));
  btn.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  });
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      btn.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (open && !root.contains(e.target)) setOpen(false);
  });

  return {
    el: root,
    get value() {
      return value;
    },
    // grey out whoever the other dropdown has picked
    block(id) {
      blockedId = id;
      items.forEach((li) => {
        const off = li.dataset.id === id;
        li.setAttribute("aria-disabled", String(off));
        li.classList.toggle("disabled", off);
        li.title = off ? "already picked in the other dropdown" : "";
      });
    },
  };
}
