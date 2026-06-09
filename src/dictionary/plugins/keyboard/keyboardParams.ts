import type { InvocationParam } from "../../../core/ir/irTypes.js";
import { keyCode, type HumanKey } from "../../params/keyCodes.js";

export function keyParam(key: HumanKey): InvocationParam {
  return {
    name: "key",
    valueType: "key",
    value: keyCode(key),
  };
}
