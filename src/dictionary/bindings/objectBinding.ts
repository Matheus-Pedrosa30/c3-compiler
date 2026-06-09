import type { ActionDraft, ConditionDraft } from "../../core/ir/irFactory.js";
import type {
  BehaviorActionDescriptor,
  BehaviorConditionDescriptor,
  ObjectActionDescriptor,
} from "./capabilityDescriptor.js";

export interface ObjectTypeToken {
  readonly id: string;
}

export interface BehaviorToken {
  readonly id: string;
}

export type ExecutableAction =
  | ActionDraft
  | ObjectActionDescriptor
  | BehaviorActionDescriptor;

export type CheckableCondition = ConditionDraft | BehaviorConditionDescriptor;

export interface BoundDslObject {
  readonly name: string;
  readonly type: ObjectTypeToken;
  readonly behaviors: readonly BehaviorToken[];
  execute(action: ExecutableAction): ActionDraft;
  check(condition: CheckableCondition): ConditionDraft;
}

export class ObjectBindingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObjectBindingError";
  }
}

export function object(
  name: string,
  type: ObjectTypeToken,
  behaviors: readonly BehaviorToken[] = [],
): BoundDslObject {
  assertNonEmptyString(name, "object name");

  return {
    name,
    type,
    behaviors,
    execute: (action) => bindAction(name, behaviors, action),
    check: (condition) => bindCondition(name, behaviors, condition),
  };
}

export function use(behavior: BehaviorToken): BehaviorToken {
  return behavior;
}

function bindAction(
  objectName: string,
  behaviors: readonly BehaviorToken[],
  action: ExecutableAction,
): ActionDraft {
  if (isActionDraft(action)) {
    return action;
  }

  if (isBehaviorActionDescriptor(action)) {
    assertObjectHasBehavior(objectName, behaviors, action.behaviorId);
  }

  return action.bindTo(objectName);
}

function bindCondition(
  objectName: string,
  behaviors: readonly BehaviorToken[],
  condition: CheckableCondition,
): ConditionDraft {
  if (isConditionDraft(condition)) {
    return condition;
  }

  assertObjectHasBehavior(objectName, behaviors, condition.behaviorId);
  return condition.bindTo(objectName);
}

function assertObjectHasBehavior(
  objectName: string,
  behaviors: readonly BehaviorToken[],
  behaviorId: string,
): void {
  if (behaviors.some((behavior) => behavior.id === behaviorId)) {
    return;
  }

  throw new ObjectBindingError(
    `Object "${objectName}" was not declared with behavior "${behaviorId}".`,
  );
}

function isActionDraft(value: ExecutableAction): value is ActionDraft {
  return value.kind === "action";
}

function isConditionDraft(value: CheckableCondition): value is ConditionDraft {
  return value.kind === "condition";
}

function isBehaviorActionDescriptor(
  value: ExecutableAction,
): value is BehaviorActionDescriptor {
  return value.kind === "behavior-action";
}

function assertNonEmptyString(value: string, label: string): void {
  if (value.length === 0) {
    throw new ObjectBindingError(`Invalid ${label}. Expected a non-empty string.`);
  }
}
