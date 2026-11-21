// Pistachoir motion (v1): scroll reveals + reservation form. Vanilla JS, no library.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("DOMContentLoaded", () => {
    const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach(el => reduce ? el.classList.add("is-in") : io.observe(el));
    const form = document.getElementById("reserve");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault(); if (!form.reportValidity()) return;
      const d = new FormData(form), st = form.querySelector(".form-status");
      const body = [`Name: ${d.get("name")}`, `Email: ${d.get("email")}`, `Tub (500 ml): ${d.get("flavour_one")} + ${d.get("flavour_two")}`, `Pickup: ${d.get("day")} from 17:00`].join("\n");
      st.textContent = "Thanks! Your email app should open with the reservation. (Demo site: the address is not real.)";
      location.href = `mailto:hello@pistachoir.example?subject=${encodeURIComponent("Tub reservation: " + d.get("name"))}&body=${encodeURIComponent(body)}`;
    });
  });
})();
