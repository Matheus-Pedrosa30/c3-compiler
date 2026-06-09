import type { PluginDefinition } from "../../../core/dictionary/dictionaryTypes.js";
import { isKeyDown, onKeyPressed } from "./keyboardConditions.js";

export const KeyboardPlugin = {
  isKeyDown,
  onKeyPressed,
} as const;

export const keyboardPluginDefinition: PluginDefinition = {
  id: "Keyboard",
  constructName: "Keyboard",
  conditions: [
    {
      kind: "condition",
      id: "isKeyDown",
      constructId: "key-is-down",
      params: [{ name: "key", valueType: "key", required: true }],
    },
    {
      kind: "condition",
      id: "onKeyPressed",
      constructId: "on-key-pressed",
      params: [{ name: "key", valueType: "key", required: true }],
    },
  ],
};
