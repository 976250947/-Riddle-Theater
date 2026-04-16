/**
 * Perform Controller — WebGAL-inspired sequential dialogue engine
 *
 * State machine:
 *   IDLE → TYPING → WAITING_CLICK → NEXT_LINE → (loop)
 *                                              → CHOICE_GATE → WAITING_CHOICE
 *
 * Core interaction pattern (two-click):
 *   Click during typing  → skip animation, show full text
 *   Click while waiting  → advance to next line
 *   At "choices" marker  → blocks advancement, waits for choice
 */

const State = {
  IDLE: "idle",
  TYPING: "typing",
  WAITING_CLICK: "waiting_click",
  CHOICE_GATE: "choice_gate"
};

export function createPerformController() {
  let lines = [];
  let lineIndex = -1;
  let currentState = State.IDLE;
  let history = [];

  // Typewriter internals
  let typewriterResolve = null;
  let typewriterAborted = false;

  // Callbacks
  let onLineChange = null;
  let onChoiceGate = null;
  let onCue = null;
  let onTypingDone = null;
  let onFinished = null;

  /**
   * Start a new performance sequence.
   * @param {Array} dialogueLines — array of line objects
   *   { speaker, text, mood, cue, type }
   */
  function startPerformance(dialogueLines) {
    lines = dialogueLines || [];
    lineIndex = -1;
    currentState = State.IDLE;
    typewriterAborted = false;
    // Keep history across stage transitions — don't clear
    advanceToNextLine();
  }

  /** Player clicked / tapped — the core interaction */
  function advance() {
    if (currentState === State.TYPING) {
      // First click: skip typewriter, show full text immediately
      typewriterAborted = true;
      if (typewriterResolve) {
        typewriterResolve();
        typewriterResolve = null;
      }
      return;
    }

    if (currentState === State.WAITING_CLICK) {
      advanceToNextLine();
      return;
    }

    // CHOICE_GATE or IDLE — do nothing on click
  }

  function advanceToNextLine() {
    lineIndex++;

    if (lineIndex >= lines.length) {
      currentState = State.IDLE;
      onFinished?.();
      return;
    }

    const line = lines[lineIndex];

    // Choice gate — stop and wait for user to pick
    if (line.type === "choices") {
      currentState = State.CHOICE_GATE;
      onChoiceGate?.(line);
      return;
    }

    // Fire cue (bg effect, shake, etc.) — non-blocking
    if (line.cue) {
      onCue?.(line.cue, line);
    }

    // Normal dialogue/narration line
    currentState = State.TYPING;
    typewriterAborted = false;
    // Record to history for backlog
    if (line.text) {
      history.push({ speaker: line.speaker || null, text: line.text, mood: line.mood || null });
    }
    onLineChange?.(line, lineIndex);
  }

  /**
   * Called by the animation layer when typewriter finishes (or is skipped).
   * Transitions to WAITING_CLICK.
   */
  function notifyTypingComplete() {
    if (currentState !== State.TYPING) return;
    currentState = State.WAITING_CLICK;
    onTypingDone?.();
  }

  /** Check if typewriter was aborted (skip requested) */
  function isSkipRequested() {
    return typewriterAborted;
  }

  /** Get the current line being displayed */
  function getCurrentLine() {
    if (lineIndex < 0 || lineIndex >= lines.length) return null;
    return lines[lineIndex];
  }

  function getState() {
    return currentState;
  }

  function getLineIndex() {
    return lineIndex;
  }

  function getTotalLines() {
    return lines.length;
  }

  /** Inject additional lines mid-sequence (for explore/dialogue results) */
  function insertLines(newLines, afterCurrentLine = true) {
    if (!newLines || !newLines.length) return;
    const insertAt = afterCurrentLine ? lineIndex + 1 : lineIndex;
    lines.splice(insertAt, 0, ...newLines);
  }

  function setCallbacks({ onLine, onChoices, onCueCallback, onTypeDone, onDone }) {
    onLineChange = onLine || null;
    onChoiceGate = onChoices || null;
    onCue = onCueCallback || null;
    onTypingDone = onTypeDone || null;
    onFinished = onDone || null;
  }

  /** Get backlog history array */
  function getHistory() {
    return history;
  }

  /** Clear backlog history (e.g. new game) */
  function clearHistory() {
    history = [];
  }

  function destroy() {
    lines = [];
    lineIndex = -1;
    currentState = State.IDLE;
    history = [];
    typewriterAborted = false;
    typewriterResolve = null;
    onLineChange = null;
    onChoiceGate = null;
    onCue = null;
    onTypingDone = null;
    onFinished = null;
  }

  return {
    startPerformance,
    advance,
    notifyTypingComplete,
    isSkipRequested,
    getCurrentLine,
    getState,
    getLineIndex,
    getTotalLines,
    insertLines,
    setCallbacks,
    getHistory,
    clearHistory,
    destroy,
    State
  };
}
