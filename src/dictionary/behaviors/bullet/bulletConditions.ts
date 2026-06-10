import { createBehaviorCondition } from "../../bindings/capabilityDescriptor.js";
import {
  comparisonParam,
  numberParam,
  type BulletComparison,
} from "./bulletParams.js";

const BULLET_BEHAVIOR_ID = "Bullet";

export function compareSpeed(comparison: BulletComparison, speed: number) {
  return createBehaviorCondition(BULLET_BEHAVIOR_ID, "compare-speed", [
    comparisonParam(comparison),
    numberParam("speed", speed),
  ]);
}

export function compareDistanceTravelled(
  comparison: BulletComparison,
  distance: number,
) {
  return createBehaviorCondition(BULLET_BEHAVIOR_ID, "compare-distance-travelled", [
    comparisonParam(comparison),
    numberParam("distance", distance),
  ]);
}

export function isEnabled() {
  return createBehaviorCondition(BULLET_BEHAVIOR_ID, "is-enabled");
}
