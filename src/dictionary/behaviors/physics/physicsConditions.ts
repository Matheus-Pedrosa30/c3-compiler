import {
  createBehaviorCondition,
  createObjectCondition,
} from "../../bindings/capabilityDescriptor.js";
import {
  comparisonParam,
  numberExpressionParam,
  objectParam,
  velocityComponentParam,
  type PhysicsComparison,
  type PhysicsVelocityComponent,
} from "./physicsParams.js";

const PHYSICS_BEHAVIOR_ID = "Physics";

export function onCollisionWithAnotherObject(objectName: string) {
  return createObjectCondition("on-collision-with-another-object", [
    objectParam("object", objectName),
  ]);
}

export function isSleeping() {
  return createBehaviorCondition(PHYSICS_BEHAVIOR_ID, "is-sleeping");
}

export function isEnabled() {
  return createBehaviorCondition(PHYSICS_BEHAVIOR_ID, "is-enabled");
}

export function compareMass(
  comparison: PhysicsComparison,
  value: number | string,
) {
  return createBehaviorCondition(PHYSICS_BEHAVIOR_ID, "compare-mass", [
    comparisonParam(comparison),
    numberExpressionParam("value", value),
  ]);
}

export function compareVelocity(
  which: PhysicsVelocityComponent,
  comparison: PhysicsComparison,
  value: number | string,
) {
  return createBehaviorCondition(PHYSICS_BEHAVIOR_ID, "compare-velocity", [
    velocityComponentParam(which),
    comparisonParam(comparison),
    numberExpressionParam("value", value),
  ]);
}

export function compareAngularVelocity(
  comparison: PhysicsComparison,
  value: number | string,
) {
  return createBehaviorCondition(
    PHYSICS_BEHAVIOR_ID,
    "compare-angular-velocity",
    [
      comparisonParam(comparison),
      numberExpressionParam("value", value),
    ],
  );
}
