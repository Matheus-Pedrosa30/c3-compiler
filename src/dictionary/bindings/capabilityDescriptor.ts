import type {
  ActionDraft,
  ConditionDraft,
  DslTargetRef,
} from "../../core/ir/irFactory.js";
import type { InvocationParam } from "../../core/ir/irTypes.js";

export interface BehaviorConditionDescriptor<
  TBehaviorId extends string = string,
  TConstructId extends string = string,
> {
  readonly kind: "behavior-condition";
  readonly behaviorId: TBehaviorId;
  readonly constructId: TConstructId;
  readonly params: readonly InvocationParam[];
  bindTo(target: string | DslTargetRef): ConditionDraft;
}

export interface BehaviorActionDescriptor<
  TBehaviorId extends string = string,
  TConstructId extends string = string,
> {
  readonly kind: "behavior-action";
  readonly behaviorId: TBehaviorId;
  readonly constructId: TConstructId;
  readonly params: readonly InvocationParam[];
  bindTo(target: string | DslTargetRef): ActionDraft;
}

export interface ObjectActionDescriptor<TConstructId extends string = string> {
  readonly kind: "object-action";
  readonly constructId: TConstructId;
  readonly params: readonly InvocationParam[];
  bindTo(target: string | DslTargetRef): ActionDraft;
}

export interface ObjectConditionDescriptor<TConstructId extends string = string> {
  readonly kind: "object-condition";
  readonly constructId: TConstructId;
  readonly params: readonly InvocationParam[];
  bindTo(target: string | DslTargetRef): ConditionDraft;
}

export function createBehaviorCondition<
  const TBehaviorId extends string,
  const TConstructId extends string,
>(
  behaviorId: TBehaviorId,
  constructId: TConstructId,
  params: readonly InvocationParam[] = [],
): BehaviorConditionDescriptor<TBehaviorId, TConstructId> {
  return {
    kind: "behavior-condition",
    behaviorId,
    constructId,
    params,
    bindTo: (target) => ({
      kind: "condition",
      dictionaryId: behaviorId,
      constructId,
      target: normalizeTarget(target, behaviorId),
      params,
    }),
  };
}

export function createBehaviorAction<
  const TBehaviorId extends string,
  const TConstructId extends string,
>(
  behaviorId: TBehaviorId,
  constructId: TConstructId,
  params: readonly InvocationParam[] = [],
): BehaviorActionDescriptor<TBehaviorId, TConstructId> {
  return {
    kind: "behavior-action",
    behaviorId,
    constructId,
    params,
    bindTo: (target) => ({
      kind: "action",
      dictionaryId: behaviorId,
      constructId,
      target: normalizeTarget(target, behaviorId),
      params,
    }),
  };
}

export function createObjectAction<const TConstructId extends string>(
  constructId: TConstructId,
  params: readonly InvocationParam[] = [],
): ObjectActionDescriptor<TConstructId> {
  return {
    kind: "object-action",
    constructId,
    params,
    bindTo: (target) => ({
      kind: "action",
      dictionaryId: "Object",
      constructId,
      target: normalizeTarget(target),
      params,
    }),
  };
}

export function createObjectCondition<const TConstructId extends string>(
  constructId: TConstructId,
  params: readonly InvocationParam[] = [],
): ObjectConditionDescriptor<TConstructId> {
  return {
    kind: "object-condition",
    constructId,
    params,
    bindTo: (target) => ({
      kind: "condition",
      dictionaryId: "Object",
      constructId,
      target: normalizeTarget(target),
      params,
    }),
  };
}

function normalizeTarget(
  target: string | DslTargetRef,
  behaviorId?: string,
): DslTargetRef {
  const objectName = typeof target === "string" ? target : target.objectName;
  const explicitBehaviorId =
    typeof target === "string" ? undefined : target.behaviorId;
  const resolvedBehaviorId = behaviorId ?? explicitBehaviorId;

  return {
    objectName,
    ...(resolvedBehaviorId === undefined
      ? {}
      : { behaviorId: resolvedBehaviorId }),
  };
}
