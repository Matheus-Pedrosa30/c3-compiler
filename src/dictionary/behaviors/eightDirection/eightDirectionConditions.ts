import { createBehaviorCondition } from "../../bindings/capabilityDescriptor.js";

export function isMoving() {
  return createBehaviorCondition("8Direction", "is-moving");
}
