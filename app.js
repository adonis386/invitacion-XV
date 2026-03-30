// Configuración rápida (edita aquí y listo)
const INVITE = {
  celebrantName: "Ashley Andreina Garcia Cartaya",
  dateISO: "2026-04-25", // YYYY-MM-DD
  startTime24h: "19:00", // HH:mm (24h)
  endTime24h: "23:30", // HH:mm (24h)
  timezone: "America/Caracas",
  venueShort: "Salón",
  venueFull: "Salón / Lugar",
  address: "La California, calle Sta. Margarita, Residencia Las Clavellinas",
  googleMapsUrl: "https://maps.app.goo.gl/qQx58P85Mmkrfs4M8",
  whatsappNumberE164: "584120000000", // sin +, ejemplo VE: 58 + número
  audioUrl: "./img/music.mp3", // opcional: "./assets/music.mp3" o URL https
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

function formatTimeEs(date) {
  return new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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
  setText("[data-event-time-text]", formatTimeEs(start));
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function initGallery() {
  const mainImg = qs(".frame__img");
  qsa("[data-photo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-photo");
      if (!src) return;
      mainImg.src = src;
    });
  });
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
  const timeText = formatTimeEs(start);

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
  const url = new URL(`https://wa.me/${INVITE.whatsappNumberE164}`);
  url.searchParams.set("text", text);
  return url.toString();
}

function buildWhatsAppConfirmUrl() {
  const url = new URL(`https://wa.me/${INVITE.whatsappNumberE164}`);
  url.searchParams.set("text", "Confirmo mi asistencia");
  return url.toString();
}

function initWhatsAppConfirmButtons() {
  const href = buildWhatsAppConfirmUrl();
  qsa("[data-wa-confirm]").forEach((el) => {
    el.setAttribute("href", href);
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

  const uid = `${INVITE.dateISO}-${INVITE.whatsappNumberE164}@invitation`;
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
  player.appendChild(source);
  player.hidden = true;
  fab.hidden = false;

  const startSec = Number(INVITE.audioPreviewStartSec ?? 0) || 0;
  const durationSec = Math.max(3, Number(INVITE.audioPreviewDurationSec ?? 18) || 18);
  const endSec = startSec + durationSec;

  /** @type {number | null} */
  let stopTimer = null;
  /** @type {"paused"|"playing"} */
  let state = "paused";
  let autoplayUnlocked = false;
  let lastAutoplayAttemptAt = 0;

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

  async function playPreview({ resetToStart }) {
    clearStopTimer();
    if (resetToStart) {
      // Asegura que el salto de tiempo sea consistente al iniciar.
      player.currentTime = startSec;
    } else {
      clampToPreviewWindow();
    }

    try {
      await player.play();
      setFabUI("playing");
      scheduleStop();
      return true;
    } catch {
      setFabUI("paused");
      return false;
    }
  }

  function pause() {
    clearStopTimer();
    player.pause();
    setFabUI("paused");
  }

  fab.addEventListener("click", () => {
    if (state === "playing") {
      pause();
      return;
    }
    void playPreview({ resetToStart: false });
  });

  player.addEventListener("timeupdate", () => {
    if (state !== "playing") return;
    if (player.currentTime >= endSec - 0.05) {
      player.currentTime = startSec;
    }
  });

  // Autoplay al hacer scroll: intentamos hasta que el navegador lo permita.
  // Nota: si el navegador requiere tap/click primero, el intento fallará hasta que haya gesto válido.
  async function attemptAutoplay() {
    if (autoplayUnlocked || state === "playing") return;
    const now = Date.now();
    if (now - lastAutoplayAttemptAt < 900) return; // throttle
    lastAutoplayAttemptAt = now;
    const ok = await playPreview({ resetToStart: true });
    if (ok) {
      autoplayUnlocked = true;
      window.removeEventListener("scroll", onUserScroll, { capture: false });
      window.removeEventListener("wheel", onUserScroll, { capture: false });
      window.removeEventListener("touchmove", onUserScroll, { capture: false });
      window.removeEventListener("keydown", onUserScroll, { capture: false });
    }
  }

  function onUserScroll() {
    void attemptAutoplay();
  }

  window.addEventListener("scroll", onUserScroll, { passive: true });
  window.addEventListener("wheel", onUserScroll, { passive: true });
  window.addEventListener("touchmove", onUserScroll, { passive: true });
  window.addEventListener("keydown", onUserScroll, { passive: true });

  // En móvil, el primer toque (gesto real) es lo que suele “desbloquear” el audio.
  // Intentamos en el primer tap/click en cualquier parte.
  const unlock = () => void attemptAutoplay();
  window.addEventListener("pointerdown", unlock, { passive: true, once: true });
  window.addEventListener("touchstart", unlock, { passive: true, once: true });

  setFabUI("paused");
}

function initMobileNav() {
  const btn = document.querySelector("[data-navbtn]");
  const menu = document.querySelector("[data-navmenu]");
  if (!btn || !menu) return;

  function setOpen(open) {
    menu.setAttribute("data-open", open ? "true" : "false");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
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
  initAudio();
  initMobileNav();
  tickCountdown();
  window.setInterval(tickCountdown, 1000);
}

document.addEventListener("DOMContentLoaded", main);

