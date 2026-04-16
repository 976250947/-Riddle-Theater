export function interpolateText(text, state) {
  if (typeof text !== "string") return "";
  return text.replaceAll("{{playerAlias}}", state.player.alias);
}

export function resolveStageText(stage, state, incomingChoice) {
  if (typeof stage.storyText === "string") {
    return interpolateText(stage.storyText, state);
  }

  const key = incomingChoice?.parsedIntent || incomingChoice?.matchedChoiceId || "default";
  const variant = stage.storyText?.[key] || stage.storyText?.default || "";
  return interpolateText(variant, state);
}

export function createGenericEndings(prefix) {
  return {
    good: {
      id: "good",
      code: `${prefix} / 01`,
      badge: "好结局 / Good Ending",
      title: "",
      subtitle: "",
      description: "",
      conditions: []
    },
    normal: {
      id: "normal",
      code: `${prefix} / 02`,
      badge: "普通结局 / Normal Ending",
      title: "",
      subtitle: "",
      description: "",
      conditions: []
    },
    bad: {
      id: "bad",
      code: `${prefix} / 03`,
      badge: "坏结局 / Bad Ending",
      title: "",
      subtitle: "",
      description: "",
      conditions: []
    },
    hidden: {
      id: "hidden",
      code: `${prefix} / 04`,
      badge: "隐藏结局 / Hidden Ending",
      title: "",
      subtitle: "",
      description: "",
      conditions: []
    }
  };
}
