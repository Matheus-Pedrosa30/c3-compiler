import type { ActionDraft, ConditionDraft } from "../../../core/ir/irFactory.js";

export type MouseButton = "left" | "middle" | "right";
export type MouseClickType = "clicked" | "double-clicked";

export function cursorIsOverObject(target: { readonly name: string } | string): ConditionDraft {
  return {
    kind: "condition",
    dictionaryId: "Mouse",
    constructId: "cursor-is-over-object",
    params: [
      {
        name: "object",
        valueType: "object",
        value: typeof target === "string" ? target : target.name,
      },
    ],
  };
}

export function onClick(
  mouseButton: MouseButton,
  clickType: MouseClickType = "clicked",
): ConditionDraft {
  return {
    kind: "condition",
    dictionaryId: "Mouse",
    constructId: "on-click",
    params: [
      {
        name: "mouse-button",
        valueType: "enum",
        value: mouseButton,
      },
      {
        name: "click-type",
        valueType: "enum",
        value: clickType,
      },
    ],
  };
}

export function setCursorStyle(cursorStyle: "none" | "normal"): ActionDraft {
  return {
    kind: "action",
    dictionaryId: "Mouse",
    constructId: "set-cursor-style2",
    params: [
      {
        name: "cursor-style",
        valueType: "enum",
        value: cursorStyle,
      },
    ],
  };
}

export const MousePlugin = {
  cursorIsOverObject,
  onClick,
  setCursorStyle,
} as const;
