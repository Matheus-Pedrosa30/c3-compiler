import { createBehaviorCondition } from "../../bindings/capabilityDescriptor.js";

export function isMoving() {
  return createBehaviorCondition("Platform", "is-moving");
}
