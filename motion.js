// Pistachoir motion (final). Vanilla JS, no library. Everything is skipped under prefers-reduced-motion.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) root.classList.add("js");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  document.addEventListener("DOMContentLoaded", () => {
    // 1. kinetic headline intro
    requestAnimationFrame(() => setTimeout(() => root.classList.add("is-loaded"), 60));

    // 2. scroll reveals, clip-path image reveals, count-up numbers
    const countUp = (el) => {
      const end = +el.dataset.count, t0 = performance.now(), dur = 1200;
      const step = (t) => { const k = clamp((t - t0) / dur, 0, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      if (end > 0) { el.textContent = "0"; requestAnimationFrame(step); }
    };
    const io = new IntersectionObserver((es) => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(e.target);
    }), { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".reveal, .clip").forEach(el => reduce ? el.classList.add("is-in") : io.observe(el));

    // 5. reservation form (demo: opens the visitor's email app)
    const form = document.getElementById("reserve");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault(); if (!form.reportValidity()) return;
      const d = new FormData(form), st = form.querySelector(".form-status");
      const body = [`Name: ${d.get("name")}`, `Email: ${d.get("email")}`, `Tub (500 ml): ${d.get("flavour_one")} + ${d.get("flavour_two")}`, `Pickup: ${d.get("day")} from 17:00`].join("\n");
      st.textContent = "Thanks! Your email app should open with the reservation. (Demo site: the address is not real.)";
      location.href = `mailto:hello@pistachoir.example?subject=${encodeURIComponent("Tub reservation: " + d.get("name"))}&body=${encodeURIComponent(body)}`;
    });

    if (reduce) return;

    // 3. cursor-following photo on flavour rows (mouse/trackpad only)
    const follow = document.querySelector(".follow");
    if (follow && matchMedia("(hover: hover)").matches) {
      let fx = 0, fy = 0, tx = 0, ty = 0, raf = 0;
      const loop = () => { fx += (tx - fx) * 0.18; fy += (ty - fy) * 0.18; follow.style.transform = `translate(${fx - 150}px, ${fy - 112}px)`; raf = requestAnimationFrame(loop); };
      document.querySelectorAll(".voices li").forEach(li => {
        li.addEventListener("mouseenter", () => { follow.src = li.dataset.img; follow.classList.add("on"); if (!raf) raf = requestAnimationFrame(loop); });
        li.addEventListener("mouseleave", () => follow.classList.remove("on"));
      });
      addEventListener("mousemove", (e) => { tx = e.clientX + 40; ty = e.clientY; });
    }

    // 4. scroll-driven layer: parallax, marquee velocity, ghost type, clip-word fill, badge, header, sticky zoom, sideways gallery
    const par = [...document.querySelectorAll("[data-speed]")];
    const ghosts = [...document.querySelectorAll("[data-x]")];
    const clipw = document.querySelector(".clipword");
    const cta = document.querySelector(".cta-fig");
    const hdr = document.querySelector(".hdr");
    const chFig = document.querySelector(".ch-fig");
    const marqs = [...document.querySelectorAll(".marquee")].map(m => ({ m, a: m.querySelector(".track").getAnimations()[0] }));
    const hs = document.querySelector(".hscroll"), track = hs && hs.querySelector(".h-track");
    const sizeH = () => { if (hs) hs.style.height = (track.scrollWidth - innerWidth + innerHeight) + "px"; };
    sizeH(); addEventListener("resize", sizeH); addEventListener("load", sizeH);

    let lastY = scrollY, vel = 0, ticking = false;
    const prog = (el) => { const r = el.getBoundingClientRect(); return clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); };
    const frame = () => {
      ticking = false;
      const y = scrollY, dy = y - lastY; lastY = y;
      vel += (dy - vel) * 0.25;
      for (const el of par) { const r = el.getBoundingClientRect(); const c = r.top + r.height / 2 - innerHeight / 2; el.style.transform = `translate3d(0, ${(c * +el.dataset.speed).toFixed(1)}px, 0)`; }
      for (const g of ghosts) { const p = prog(g.parentElement); g.style.transform = `translate3d(${(-p * innerWidth * +g.dataset.x * 2 + innerWidth * 0.1).toFixed(1)}px, 0, 0)`; }
      if (clipw) clipw.style.setProperty("--bx", (prog(clipw) * 100).toFixed(1) + "%");
      if (cta) cta.style.setProperty("--rot", ((prog(cta) - 0.5) * -10).toFixed(2));
      if (chFig) chFig.style.setProperty("--p", prog(chFig.closest(".chapters")).toFixed(3));
      for (const { m, a } of marqs) { m.style.setProperty("--skew", clamp(vel * 0.08, -4, 4).toFixed(2)); if (a) a.playbackRate = (dy < 0 ? -1 : 1) * (1 + Math.min(Math.abs(vel) * 0.12, 5)); }
      if (hdr) hdr.classList.toggle("hide", dy > 2 && y > 240);
      if (hdr && dy < -2) hdr.classList.remove("hide");
      if (hs) { const r = hs.getBoundingClientRect(); const max = track.scrollWidth - innerWidth; const p = clamp(-r.top / (hs.offsetHeight - innerHeight), 0, 1); track.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`; hs.style.setProperty("--hp", p.toFixed(3)); }
      if (Math.abs(vel) > 0.05) req();
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    addEventListener("scroll", req, { passive: true }); req();
  });
})();
