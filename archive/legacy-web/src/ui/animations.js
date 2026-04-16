function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function setInteractionDisabled(elements, disabled) {
  const choiceButtons = elements.vnChoiceList
    ? elements.vnChoiceList.querySelectorAll("button")
    : elements.choiceList.querySelectorAll("button");
  choiceButtons.forEach((button) => {
    button.disabled = disabled;
  });
  if (elements.freeInput) elements.freeInput.disabled = disabled;
  const submitButton = elements.freeInputForm?.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = disabled;
  }
}

export async function playStreamTransition(elements, payloadText) {
  const shortText = payloadText.length > 18 ? `${payloadText.slice(0, 18)}…` : payloadText || "新的回应";
  elements.streamLabel.textContent = `正在根据“${shortText}”生成后续剧情`;
  elements.streamStatus.classList.remove("hidden");
  elements.streamStatus.classList.add("active");

  if (prefersReducedMotion()) {
    await wait(180);
    return;
  }

  await wait(950);
}

export function stopStreamTransition(elements) {
  elements.streamStatus.classList.remove("active");
  elements.streamStatus.classList.add("hidden");
}

export async function playCurrentNodeReveal(elements) {
  // Legacy compatibility — no-op when VN mode is active
  return;
}

/**
 * VN typewriter: animate text character-by-character into elements.vnTextContent.
 * Returns a controller with { skip() } to complete instantly.
 * Calls onComplete when done.
 */
export function startVnTypewriter(elements, onComplete) {
  const node = elements.vnTextContent;
  if (!node) {
    onComplete?.();
    return { skip() {} };
  }

  const fullText = node.dataset.fullText || "";
  if (!fullText || prefersReducedMotion()) {
    node.textContent = fullText;
    node.classList.remove("typing");
    if (elements.vnAdvanceHint) elements.vnAdvanceHint.classList.remove("hidden");
    onComplete?.();
    return { skip() {} };
  }

  let cancelled = false;
  let index = 0;
  const chunkSize = 2;
  const baseDelay = 30;

  node.textContent = "";
  node.classList.add("typing");

  function tick() {
    if (cancelled) return;
    if (index >= fullText.length) {
      node.classList.remove("typing");
      if (elements.vnAdvanceHint) elements.vnAdvanceHint.classList.remove("hidden");
      onComplete?.();
      return;
    }
    node.textContent += fullText.slice(index, index + chunkSize);
    const delay = resolveDelay(fullText[index], baseDelay);
    index += chunkSize;
    window.setTimeout(tick, delay);
  }

  tick();

  return {
    skip() {
      if (cancelled) return;
      cancelled = true;
      node.textContent = fullText;
      node.classList.remove("typing");
      if (elements.vnAdvanceHint) elements.vnAdvanceHint.classList.remove("hidden");
      onComplete?.();
    }
  };
}

async function typewriter(node, delay, chunkSize) {
  const fullText = node.textContent || "";
  node.textContent = "";
  node.classList.remove("pending-type");
  node.classList.add("typing");

  for (let index = 0; index < fullText.length; index += chunkSize) {
    node.textContent += fullText.slice(index, index + chunkSize);
    await wait(resolveDelay(fullText[index], delay));
  }

  node.classList.remove("typing");
}

function resolveDelay(currentChar, baseDelay) {
  if (["。", "！", "？", ".", "!", "?"].includes(currentChar)) {
    return baseDelay * 4;
  }
  if ([",", "，", "、", ";", "；", ":", "："].includes(currentChar)) {
    return baseDelay * 2.5;
  }
  return baseDelay;
}

function revealChoices(buttons, immediate = false) {
  buttons.forEach((button, index) => {
    if (immediate) {
      button.classList.add("visible");
      return;
    }
    // WebGAL-inspired staggered cubic ease-out reveal
    window.setTimeout(() => {
      button.classList.add("revealing");
      button.addEventListener("animationend", () => {
        button.classList.remove("revealing");
        button.classList.add("visible");
      }, { once: true });
    }, index * 100);
  });
}

export async function transitionToScreen(elements, nextScreenName) {
  const activeEntry = Object.entries(elements.screens).find(([, node]) =>
    node.classList.contains("active")
  );
  const activeNode = activeEntry?.[1] || null;
  const nextNode = elements.screens[nextScreenName];

  if (!nextNode || activeNode === nextNode) {
    return;
  }

  if (prefersReducedMotion()) {
    if (activeNode) {
      activeNode.classList.remove("active");
    }
    nextNode.classList.add("active");
    return;
  }

  if (activeNode) {
    activeNode.classList.add("screen-leaving");
    await wait(210);
    activeNode.classList.remove("active", "screen-leaving");
  }

  nextNode.classList.add("active", "screen-entering");
  await wait(260);
  nextNode.classList.remove("screen-entering");
}

/* ── WebGAL-inspired Background Crossfade ── */

const BG_CAMERA_EFFECTS = ["bg-breathe", "bg-drift-left", "bg-drift-right", "bg-focus-center", "bg-shake"];

export function crossfadeBackground(bgLayer, newTheme) {
  if (!bgLayer) return;
  const current = bgLayer.querySelector(".bg-current");
  if (!current) return;

  // Clone current as the "old" layer that fades out
  const old = current.cloneNode(true);
  old.className = "bg-old";
  bgLayer.insertBefore(old, current);

  // Reset entrance animation on current by forcing reflow
  current.style.animation = "none";
  void current.offsetHeight;
  current.style.animation = "";

  // Clean up old layer after its fadeout animation completes
  old.addEventListener("animationend", () => old.remove(), { once: true });
  // Safety fallback
  window.setTimeout(() => { if (old.parentNode) old.remove(); }, 3000);
}

export function setBgCameraEffect(bgLayer, effectName) {
  if (!bgLayer) return;
  BG_CAMERA_EFFECTS.forEach((cls) => bgLayer.classList.remove(cls));
  if (effectName && BG_CAMERA_EFFECTS.includes(effectName)) {
    bgLayer.classList.add(effectName);
  }
}

/* ── WebGAL-inspired Smart Auto-Hide (topbar + control panel) ── */

let topbarTimer = null;
let lastMouseX = 0;
let lastMouseY = 0;
const TOPBAR_HIDE_DELAY = 2500;
const MOUSE_DEADZONE = 4;

let _controlPanelEl = null;

export function initTopbarAutoHide(topbarElement, gameScreenElement) {
  if (!topbarElement || !gameScreenElement) return;

  // Also grab the control panel for synchronized show/hide
  _controlPanelEl = gameScreenElement.querySelector(".vn-control-panel");

  function showAll() {
    topbarElement.classList.remove("topbar-hidden");
    if (_controlPanelEl) _controlPanelEl.classList.remove("panel-hidden");
    clearTimeout(topbarTimer);
    topbarTimer = window.setTimeout(hideAll, TOPBAR_HIDE_DELAY);
  }

  function hideAll() {
    if (topbarElement.matches(":hover")) return;
    if (_controlPanelEl && _controlPanelEl.matches(":hover")) return;
    topbarElement.classList.add("topbar-hidden");
    if (_controlPanelEl) _controlPanelEl.classList.add("panel-hidden");
  }

  gameScreenElement.addEventListener("mousemove", (event) => {
    const dx = event.clientX - lastMouseX;
    const dy = event.clientY - lastMouseY;
    if (dx * dx + dy * dy > MOUSE_DEADZONE * MOUSE_DEADZONE) {
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
      showAll();
    }
  });

  topbarElement.addEventListener("mouseenter", () => {
    clearTimeout(topbarTimer);
    topbarElement.classList.remove("topbar-hidden");
    if (_controlPanelEl) _controlPanelEl.classList.remove("panel-hidden");
  });

  topbarElement.addEventListener("mouseleave", () => {
    topbarTimer = window.setTimeout(hideAll, TOPBAR_HIDE_DELAY);
  });

  if (_controlPanelEl) {
    _controlPanelEl.addEventListener("mouseenter", () => {
      clearTimeout(topbarTimer);
      topbarElement.classList.remove("topbar-hidden");
      _controlPanelEl.classList.remove("panel-hidden");
    });
    _controlPanelEl.addEventListener("mouseleave", () => {
      topbarTimer = window.setTimeout(hideAll, TOPBAR_HIDE_DELAY);
    });
  }

  // Tap on mobile shows both
  gameScreenElement.addEventListener("touchstart", showAll, { passive: true });

  // Initial: visible, then auto-hide after delay
  showAll();
}

export function resetTopbarAutoHide() {
  clearTimeout(topbarTimer);
}

