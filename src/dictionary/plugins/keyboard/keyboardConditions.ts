import type { ConditionDraft } from "../../../core/ir/irFactory.js";
import type { HumanKey } from "../../params/keyCodes.js";
import { keyParam } from "./keyboardParams.js";

export function isKeyDown(key: HumanKey): ConditionDraft {
  return {
    kind: "condition",
    dictionaryId: "Keyboard",
    constructId: "key-is-down",
    params: [keyParam(key)],
  };
}

export function onKeyPressed(key: HumanKey): ConditionDraft {
  return {
    kind: "condition",
    dictionaryId: "Keyboard",
    constructId: "on-key-pressed",
    params: [keyParam(key)],
  };
}
