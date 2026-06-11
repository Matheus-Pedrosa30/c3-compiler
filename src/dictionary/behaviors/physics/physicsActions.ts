import { createBehaviorAction } from "../../bindings/capabilityDescriptor.js";
import { enumParam, numberExpressionParam } from "./physicsParams.js";

const PHYSICS_BEHAVIOR_ID = "Physics";

export function setEnabled(isEnabled: boolean) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "set-enabled", [
    enumParam("mode", isEnabled ? "enabled" : "disabled"),
  ]);
}

export function setImmovable(isImmovable: boolean) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "set-immovable", [
    enumParam("setting", isImmovable ? "immovable" : "movable"),
  ]);
}

export function setWorldGravity(gravity: number | string) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "set-world-gravity", [
    numberExpressionParam("gravity", gravity),
  ]);
}

export function setDensity(density: number | string) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "set-density", [
    numberExpressionParam("density", density),
  ]);
}

export function setFriction(friction: number | string) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "set-friction", [
    numberExpressionParam("friction", friction),
  ]);
}

export function setElasticity(elasticity: number | string) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "set-elasticity", [
    numberExpressionParam("elasticity", elasticity),
  ]);
}

export function applyImpulseAtAngle(
  impulse: number | string,
  angle: number | string,
  imagePoint: number | string = 0,
) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "apply-impulse-at-angle", [
    numberExpressionParam("impulse", impulse),
    numberExpressionParam("angle", angle),
    numberExpressionParam("image-point", imagePoint),
  ]);
}

export function applyForceAtAngle(
  force: number | string,
  angle: number | string,
  imagePoint: number | string = 0,
) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "apply-force-at-angle", [
    numberExpressionParam("force", force),
    numberExpressionParam("angle", angle),
    numberExpressionParam("image-point", imagePoint),
  ]);
}

export function applyForce(
  forceX: number | string,
  forceY: number | string,
  imagePoint: number | string = 0,
) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "apply-force", [
    numberExpressionParam("force-x", forceX),
    numberExpressionParam("force-y", forceY),
    numberExpressionParam("image-point", imagePoint),
  ]);
}

export function setVelocity(
  xComponent: number | string,
  yComponent: number | string,
) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "set-velocity", [
    numberExpressionParam("x-component", xComponent),
    numberExpressionParam("y-component", yComponent),
  ]);
}

export function setAngularVelocity(angularVelocity: number | string) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "set-angular-velocity", [
    numberExpressionParam("angular-velocity", angularVelocity),
  ]);
}

export function setAngularDamping(angularDamping: number | string) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "set-angular-damping", [
    numberExpressionParam("angular-damping", angularDamping),
  ]);
}

export function teleport(x: number | string, y: number | string) {
  return createBehaviorAction(PHYSICS_BEHAVIOR_ID, "teleport", [
    numberExpressionParam("x", x),
    numberExpressionParam("y", y),
  ]);
}
