// Configuración rápida (edita aquí y listo)
const INVITE = {
  celebrantName: "Ashley Andreina Garcia Cartaya",
  dateISO: "2026-04-25", // YYYY-MM-DD
  startTime24h: "20:00", // HH:mm (24h)
  endTime24h: "23:30", // HH:mm (24h)
  timezone: "America/Caracas",
  venueShort: "Residencia Las Clavellinas",
  venueFull: "Residencia Las Clavellinas",
  address: "La California, calle Sta. Margarita, Residencia Las Clavellinas",
  googleMapsUrl: "https://maps.app.goo.gl/qQx58P85Mmkrfs4M8",
  /** Números para confirmar asistencia (sin +). Aparecen dos botones en la invitación. */
  whatsappNumbersE164: ["584128200886", "584121254166"],
  audioUrl: "./img/music.mp3", // MP3 en la misma carpeta del sitio (o URL https)
  audioPreviewStartSec: 18, // desde qué segundo empieza el fragmento
  audioPreviewDurationSec: 20, // duración del fragmento
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateEs(date) {
  return new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTimeAmPm(date) {
  const h24 = date.getHours();
  const m = pad2(date.getMinutes());
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = ((h24 + 11) % 12) + 1;
  return `${h12}:${m} ${ampm}`;
}

function getEventStartLocalDate() {
  // Usamos hora local del dispositivo (más simple para invitación).
  // Si necesitas exactitud por zona horaria, se puede migrar a una librería.
  const [y, m, d] = INVITE.dateISO.split("-").map(Number);
  const [hh, mm] = INVITE.startTime24h.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function getEventEndLocalDate() {
  const [y, m, d] = INVITE.dateISO.split("-").map(Number);
  const [hh, mm] = INVITE.endTime24h.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function qs(sel) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`No se encontró el elemento: ${sel}`);
  return el;
}

function qsa(sel) {
  return Array.from(document.querySelectorAll(sel));
}

function setText(sel, value) {
  const el = document.querySelector(sel);
  if (el) el.textContent = value;
}

function setAttr(sel, name, value) {
  const el = document.querySelector(sel);
  if (el) el.setAttribute(name, value);
}

function initStaticTexts() {
  qsa("[data-invitee-name]").forEach((el) => (el.textContent = INVITE.celebrantName));
  setText("[data-event-venue-short]", INVITE.venueShort);
  setText("[data-event-venue]", INVITE.venueFull);
  setText("[data-event-address]", INVITE.address);
  setAttr("[data-open-maps]", "href", INVITE.googleMapsUrl);
  setAttr("[data-map-preview]", "href", INVITE.googleMapsUrl);

  const start = getEventStartLocalDate();
  setText("[data-event-date-text]", capitalize(formatDateEs(start)));
  setText("[data-event-time-text]", formatTimeAmPm(start));
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function initGallery() {
  const dialog = document.querySelector("[data-lightbox]");
  const img = document.querySelector("[data-lb-img]");
  const closeBtn = document.querySelector("[data-lb-close]");
  const prevBtn = document.querySelector("[data-lb-prev]");
  const nextBtn = document.querySelector("[data-lb-next]");
  const items = qsa("[data-gallery-src]");

  if (!dialog || !(dialog instanceof HTMLDialogElement) || !img || !closeBtn || !prevBtn || !nextBtn) return;
  if (items.length === 0) return;

  const sources = items.map((b) => b.getAttribute("data-gallery-src")).filter(Boolean);
  /** @type {number} */
  let index = 0;

  function render() {
    const src = sources[index];
    if (!src) return;
    img.setAttribute("src", src);
  }

  function openAt(i) {
    index = Math.max(0, Math.min(sources.length - 1, i));
    render();
    dialog.showModal();
    closeBtn.focus();
  }

  function close() {
    dialog.close();
  }

  function prev() {
    index = (index - 1 + sources.length) % sources.length;
    render();
  }

  function next() {
    index = (index + 1) % sources.length;
    render();
  }

  items.forEach((btn, i) => {
    btn.addEventListener("click", () => openAt(i));
  });

  closeBtn.addEventListener("click", close);
  dialog.addEventListener("click", (e) => {
    // click fuera del contenido = cerrar
    const rect = dialog.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    const inRect = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (!inRect) close();
  });
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  window.addEventListener("keydown", (e) => {
    if (!dialog.open) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  // swipe simple en móvil
  let startX = 0;
  let startY = 0;
  img.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
    },
    { passive: true },
  );
  img.addEventListener(
    "touchend",
    (e) => {
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx > 0) prev();
      else next();
    },
    { passive: true },
  );
}

function tickCountdown() {
  const start = getEventStartLocalDate();
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();

  const noteEl = document.querySelector("[data-countdown-note]");

  if (diffMs <= 0) {
    setText("[data-days]", "0");
    setText("[data-hours]", "0");
    setText("[data-minutes]", "0");
    setText("[data-seconds]", "0");
    if (noteEl) noteEl.textContent = "¡Hoy es el gran día!";
    return;
  }

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / (60 * 60 * 24));
  const hours = Math.floor((totalSec / (60 * 60)) % 24);
  const minutes = Math.floor((totalSec / 60) % 60);
  const seconds = Math.floor(totalSec % 60);

  setText("[data-days]", String(days));
  setText("[data-hours]", pad2(hours));
  setText("[data-minutes]", pad2(minutes));
  setText("[data-seconds]", pad2(seconds));
  if (noteEl) noteEl.textContent = "Te espero con mucho cariño.";
}

function buildWhatsAppUrl({ guestName, attendance, companions, message }) {
  const start = getEventStartLocalDate();
  const dateText = capitalize(formatDateEs(start));
  const timeText = formatTimeAmPm(start);

  const companionsText =
    companions && companions.trim() !== "" ? `Acompañantes: ${companions.trim()}` : "Acompañantes: 0";

  const lines = [
    `Hola! Soy ${guestName}.`,
    `Confirmación: ${attendance === "sí" ? "Sí asistiré" : "No podré asistir"}.`,
    companionsText,
    `Evento: Mis 15 de ${INVITE.celebrantName}.`,
    `Fecha: ${dateText} · ${timeText}.`,
  ];

  const extra = message?.trim();
  if (extra) lines.push(`Mensaje: ${extra}`);

  const text = lines.join("\n");
  const num = INVITE.whatsappNumbersE164[0] ?? "";
  const url = new URL(`https://wa.me/${num}`);
  url.searchParams.set("text", text);
  return url.toString();
}

function buildWhatsAppConfirmUrl(e164) {
  const url = new URL(`https://wa.me/${e164}`);
  url.searchParams.set("text", "Confirmo mi asistencia");
  return url.toString();
}

function initWhatsAppConfirmButtons() {
  const nums = INVITE.whatsappNumbersE164 ?? [];
  qsa("[data-wa-confirm]").forEach((el) => {
    const idx = Number(el.getAttribute("data-wa-index") ?? "0");
    const e164 = nums[idx] ?? nums[0];
    if (!e164) return;
    el.setAttribute("href", buildWhatsAppConfirmUrl(String(e164)));
  });
}

// (RSVP form removed; we use direct WhatsApp confirm button.)

function toICSDateUTC(date) {
  // Export sencillo: convertimos a UTC para evitar incompatibilidades.
  const y = date.getUTCFullYear();
  const m = pad2(date.getUTCMonth() + 1);
  const d = pad2(date.getUTCDate());
  const hh = pad2(date.getUTCHours());
  const mm = pad2(date.getUTCMinutes());
  const ss = pad2(date.getUTCSeconds());
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function downloadCalendarICS() {
  const startLocal = getEventStartLocalDate();
  const endLocal = getEventEndLocalDate();

  const startUTC = new Date(startLocal.getTime() - startLocal.getTimezoneOffset() * 60_000);
  const endUTC = new Date(endLocal.getTime() - endLocal.getTimezoneOffset() * 60_000);

  const uid = `${INVITE.dateISO}-${(INVITE.whatsappNumbersE164 ?? []).join("-")}@invitation`;
  const now = new Date();
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitacion XV//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDateUTC(new Date(now.getTime() - now.getTimezoneOffset() * 60_000))}`,
    `DTSTART:${toICSDateUTC(startUTC)}`,
    `DTEND:${toICSDateUTC(endUTC)}`,
    `SUMMARY:Mis 15 de ${INVITE.celebrantName}`,
    `LOCATION:${escapeICS(`${INVITE.venueFull} - ${INVITE.address}`)}`,
    `DESCRIPTION:${escapeICS(`Te espero! Ubicación: ${INVITE.googleMapsUrl}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Mis15-${INVITE.celebrantName}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 8000);
}

function escapeICS(s) {
  return String(s)
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function initCalendarButton() {
  const btn = document.querySelector("[data-add-calendar]");
  if (!btn) return;
  btn.addEventListener("click", downloadCalendarICS);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function initCopyAddress() {
  const btn = document.querySelector("[data-copy-address]");
  const hint = document.querySelector("[data-copy-hint]");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const ok = await copyText(INVITE.address);
    if (hint) hint.textContent = ok ? "Dirección copiada." : "No se pudo copiar. Selecciona y copia manualmente.";
    window.setTimeout(() => {
      if (hint) hint.textContent = "";
    }, 2500);
  });
}

function initReveal() {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const els = qsa(".reveal");

  if (reduceMotion) {
    els.forEach((el) => el.classList.add("reveal--in"));
    return;
  }

  // Stagger suave por orden en DOM
  els.forEach((el, idx) => {
    const mod = idx % 5;
    if (mod === 1) el.classList.add("reveal--delay-1");
    if (mod === 2) el.classList.add("reveal--delay-2");
    if (mod === 3) el.classList.add("reveal--delay-3");
    if (mod === 4) el.classList.add("reveal--delay-4");
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("reveal--in");
        io.unobserve(entry.target);
      }
    },
    { root: null, threshold: 0.12, rootMargin: "40px 0px -10% 0px" },
  );

  els.forEach((el) => io.observe(el));
}

function initGsapPlus() {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (reduceMotion || !gsap) return;

  if (ScrollTrigger && gsap.registerPlugin) gsap.registerPlugin(ScrollTrigger);

  // Hero: respiración sutil del marco y la foto
  const frame = document.querySelector(".frame");
  if (frame) {
    gsap.to(frame, {
      y: -6,
      duration: 3.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  const heroImg = document.querySelector(".frame__img");
  if (heroImg) {
    gsap.to(heroImg, {
      scale: 1.06,
      duration: 5.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  const halo = document.querySelector(".frame__halo");
  const glow = document.querySelector(".frame__glow");
  if (halo) {
    gsap.to(halo, {
      opacity: 1,
      duration: 2.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    gsap.to(halo, {
      rotation: 360,
      transformOrigin: "50% 50%",
      duration: 18,
      ease: "none",
      repeat: -1,
    });
  }
  if (glow) {
    gsap.to(glow, {
      opacity: 0.55,
      duration: 2.8,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }

  const heroMedia = document.querySelector(".hero__media");
  const heroCopy = document.querySelector(".hero__copy");
  if (ScrollTrigger && heroMedia && heroCopy) {
    gsap.to(heroMedia, {
      y: -18,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
    });
    gsap.to(heroCopy, {
      y: 10,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 },
    });
  }

  // Galería: entrada con stagger y hover “lift”
  const items = gsap.utils?.toArray ? gsap.utils.toArray(".gitem") : Array.from(document.querySelectorAll(".gitem"));
  if (items.length && ScrollTrigger) {
    gsap.from(items, {
      opacity: 0,
      y: 26,
      scale: 0.98,
      filter: "blur(10px)",
      duration: 0.9,
      ease: "power2.out",
      stagger: { each: 0.10, from: "random" },
      scrollTrigger: { trigger: ".gallery", start: "top 80%" },
    });
  }
}

function initAudio() {
  const player = document.querySelector("[data-audio-player]");
  const fab = document.querySelector("[data-musicfab]");
  if (!player || !fab) return;

  const url = String(INVITE.audioUrl || "").trim();
  if (!url) {
    fab.hidden = true;
    return;
  }

  const source = document.createElement("source");
  source.src = url;
  source.type = "audio/mpeg";
  player.appendChild(source);
  player.hidden = true;
  fab.hidden = false;
  // Performance: no cargues el MP3 hasta que haya un gesto del usuario
  let loaded = false;

  const startSec = Number(INVITE.audioPreviewStartSec ?? 0) || 0;
  const durationSec = Math.max(3, Number(INVITE.audioPreviewDurationSec ?? 18) || 18);
  const endSec = startSec + durationSec;

  /** @type {number | null} */
  let stopTimer = null;
  /** @type {"paused"|"playing"} */
  let state = "paused";
  let autoplayUnlocked = false;
  let lastAutoplayAttemptAt = 0;
  let gestureHooksInstalled = false;

  function setFabUI(nextState) {
    state = nextState;
    fab.setAttribute("aria-pressed", state === "playing" ? "true" : "false");
    fab.setAttribute("aria-label", state === "playing" ? "Pausar música" : "Reproducir música");
    const icon = fab.querySelector("i");
    if (!icon) return;
    icon.className = state === "playing" ? "fa-solid fa-pause" : "fa-solid fa-play";
  }

  function clearStopTimer() {
    if (stopTimer == null) return;
    window.clearTimeout(stopTimer);
    stopTimer = null;
  }

  function scheduleStop() {
    clearStopTimer();
    stopTimer = window.setTimeout(() => {
      player.pause();
      setFabUI("paused");
    }, durationSec * 1000);
  }

  function clampToPreviewWindow() {
    if (!Number.isFinite(player.currentTime)) return;
    if (player.currentTime < startSec) player.currentTime = startSec;
    if (player.currentTime > endSec) player.currentTime = startSec;
  }

  function removeScrollAutoplayListeners() {
    window.removeEventListener("scroll", onUserScroll);
  }

  function onPlaySucceeded() {
    autoplayUnlocked = true;
    setFabUI("playing");
    scheduleStop();
    fab.classList.remove("musicfab--hint");
    removeScrollAutoplayListeners();
    removeGestureUnlockListeners();
  }

  function onPlayFailed() {
    setFabUI("paused");
    fab.classList.add("musicfab--hint");
  }

  /**
   * iOS/Safari: play() debe llamarse en el mismo “tick” del gesto del usuario.
   * No uses async/await antes de play() en listeners de documento.
   */
  function playFromUserGesture(resetToStart) {
    clearStopTimer();
    if (!loaded) {
      loaded = true;
      player.load();
    }
    if (resetToStart) player.currentTime = startSec;
    else clampToPreviewWindow();
    const p = player.play();
    if (p !== undefined) {
      p.then(onPlaySucceeded).catch(onPlayFailed);
    } else {
      onPlaySucceeded();
    }
  }

  fab.addEventListener("click", (e) => {
    e.stopPropagation();
    if (state === "playing") {
      clearStopTimer();
      player.pause();
      setFabUI("paused");
      return;
    }
    playFromUserGesture(false);
  });

  player.addEventListener("timeupdate", () => {
    if (state !== "playing") return;
    if (player.currentTime >= endSec - 0.05) {
      player.currentTime = startSec;
    }
  });

  function onUserScroll() {
    if (autoplayUnlocked || state === "playing") return;
    // Solo una vez: primer “gesto de scroll” del usuario (móvil/PC)
    removeScrollAutoplayListeners();
    window.removeEventListener("wheel", onUserScroll);
    window.removeEventListener("touchmove", onUserScroll);
    const now = Date.now();
    if (now - lastAutoplayAttemptAt < 250) return;
    lastAutoplayAttemptAt = now;
    playFromUserGesture(true);
  }

  window.addEventListener("scroll", onUserScroll, { passive: true });
  window.addEventListener("wheel", onUserScroll, { passive: true });
  window.addEventListener("touchmove", onUserScroll, { passive: true });

  function onGestureUnlock(/** @type {Event} */ e) {
    if (autoplayUnlocked || state === "playing") {
      removeGestureUnlockListeners();
      return;
    }
    const el = e.target;
    if (el instanceof Element && el.closest("[data-musicfab]")) return;

    const now = Date.now();
    if (now - lastAutoplayAttemptAt < 250) return;
    lastAutoplayAttemptAt = now;

    playFromUserGesture(true);
  }

  function removeGestureUnlockListeners() {
    if (!gestureHooksInstalled) return;
    gestureHooksInstalled = false;
    document.removeEventListener("click", onGestureUnlock, true);
    document.removeEventListener("touchend", onGestureUnlock, true);
  }

  gestureHooksInstalled = true;
  document.addEventListener("click", onGestureUnlock, true);
  document.addEventListener("touchend", onGestureUnlock, { capture: true, passive: true });

  setFabUI("paused");
}

function initMobileNav() {
  const btn = document.querySelector("[data-navbtn]");
  const menu = document.querySelector("[data-navmenu]");
  const backdrop = document.querySelector("[data-navbackdrop]");
  if (!btn || !menu || !backdrop) return;

  function setOpen(open) {
    menu.setAttribute("data-open", open ? "true" : "false");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    backdrop.hidden = !open;
    const icon = btn.querySelector("i");
    if (icon) icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  }

  setOpen(false);

  btn.addEventListener("click", () => {
    const isOpen = menu.getAttribute("data-open") === "true";
    setOpen(!isOpen);
  });

  menu.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a") : null;
    if (a) setOpen(false);
  });

  backdrop.addEventListener("click", () => setOpen(false));

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

function main() {
  initStaticTexts();
  initGallery();
  initWhatsAppConfirmButtons();
  initCalendarButton();
  initCopyAddress();
  initReveal();
  initGsapPlus();
  initAudio();
  initMobileNav();
  tickCountdown();
  window.setInterval(tickCountdown, 1000);
}

document.addEventListener("DOMContentLoaded", main);

