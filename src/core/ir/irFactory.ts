import type { SidAllocator } from "../sid/sidAllocator.js";
import type {
  ActionNode,
  BlockNode,
  CommentNode,
  ConditionNode,
  ConstructJsonValue,
  ConstructProjectSnapshot,
  ConstructValueType,
  EventNode,
  FunctionBlockNode,
  GroupNode,
  IncludeNode,
  InvocationParam,
  InvocationTarget,
  IrMetadata,
  SheetIr,
} from "./irTypes.js";

export interface DslTargetRef {
  readonly objectName: string;
  readonly behaviorId?: string;
}

export interface InvocationDraft {
  readonly dictionaryId: string;
  readonly constructId: string;
  readonly target?: DslTargetRef;
  readonly params?: readonly InvocationParam[];
  readonly metadata?: IrMetadata;
}

export interface ConditionDraft extends InvocationDraft {
  readonly kind: "condition";
  readonly isInverted?: boolean;
}

export interface ActionDraft extends InvocationDraft {
  readonly kind: "action";
  readonly disabled?: boolean;
}

export interface GroupOptions {
  readonly disabled?: boolean;
  readonly activeOnStart?: boolean;
  readonly isActiveOnStart?: boolean;
  readonly children?: readonly unknown[];
  readonly metadata?: IrMetadata;
}

export interface BlockOptions {
  readonly conditions?: readonly unknown[];
  readonly actions?: readonly unknown[];
  readonly metadata?: IrMetadata;
}

export class IrFactoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IrFactoryError";
  }
}

export class IrFactory {
  readonly #projectSnapshot: ConstructProjectSnapshot;
  readonly #sidAllocator: SidAllocator;

  constructor(
    projectSnapshot: ConstructProjectSnapshot,
    sidAllocator: SidAllocator,
  ) {
    this.#projectSnapshot = projectSnapshot;
    this.#sidAllocator = sidAllocator;
  }

  createSheet(sheetName: unknown, children: readonly unknown[]): SheetIr {
    assertNonEmptyString(sheetName, "sheet name");

    return {
      sheetName,
      children: this.#materializeEventChildren(children, `sheet "${sheetName}"`),
    };
  }

  createInclude(includeSheet: unknown): IncludeNode {
    assertNonEmptyString(includeSheet, "include sheet name");

    return {
      eventType: "include",
      sid: this.#sidAllocator.allocate(),
      includeSheet,
    };
  }

  createComment(text: unknown): CommentNode {
    assertString(text, "comment text");

    return {
      eventType: "comment",
      sid: this.#sidAllocator.allocate(),
      text,
    };
  }

  createGroup(title: unknown, options: unknown = {}): GroupNode {
    assertNonEmptyString(title, "group title");
    assertPlainObject(options, `group "${title}" options`);

    const groupOptions = options as GroupOptions;
    const disabled = groupOptions.disabled ?? false;
    const isActiveOnStart =
      groupOptions.isActiveOnStart ?? groupOptions.activeOnStart ?? true;

    assertBoolean(disabled, `group "${title}" disabled`);
    assertBoolean(isActiveOnStart, `group "${title}" isActiveOnStart`);

    return {
      eventType: "group",
      sid: this.#sidAllocator.allocate(),
      title,
      disabled,
      isActiveOnStart,
      children: this.#materializeEventChildren(
        groupOptions.children ?? [],
        `group "${title}"`,
      ),
      ...(groupOptions.metadata === undefined
        ? {}
        : { metadata: groupOptions.metadata }),
    };
  }

  createBlock(titleOrOptions: unknown = {}, maybeOptions?: unknown): BlockNode {
    const { label, options } = normalizeBlockArgs(titleOrOptions, maybeOptions);

    return {
      eventType: "block",
      sid: this.#sidAllocator.allocate(),
      conditions: this.#materializeConditions(
        options.conditions ?? [],
        label,
      ),
      actions: this.#materializeActions(options.actions ?? [], label),
      ...(options.metadata === undefined
        ? {}
        : { metadata: options.metadata }),
    };
  }

  createFunctionBlock(name: unknown): FunctionBlockNode {
    assertNonEmptyString(name, "function block name");

    return {
      eventType: "function-block",
      sid: this.#sidAllocator.allocate(),
      name,
      parameters: [],
      children: [],
    };
  }

  createCondition(draft: ConditionDraft): ConditionNode {
    assertInvocationDraft(draft, "condition");
    const target = this.#resolveInvocationTarget(draft.target);

    return {
      kind: "condition",
      sid: this.#sidAllocator.allocate(),
      dictionaryId: draft.dictionaryId,
      constructId: draft.constructId,
      params: validateInvocationParams(draft.params ?? [], "condition"),
      isInverted: draft.isInverted ?? false,
      ...(target === undefined ? {} : { target }),
      ...(draft.metadata === undefined ? {} : { metadata: draft.metadata }),
    };
  }

  createAction(draft: ActionDraft): ActionNode {
    assertInvocationDraft(draft, "action");
    const target = this.#resolveInvocationTarget(draft.target);

    return {
      kind: "action",
      sid: this.#sidAllocator.allocate(),
      dictionaryId: draft.dictionaryId,
      constructId: draft.constructId,
      params: validateInvocationParams(draft.params ?? [], "action"),
      ...(draft.disabled === undefined ? {} : { disabled: draft.disabled }),
      ...(target === undefined ? {} : { target }),
      ...(draft.metadata === undefined ? {} : { metadata: draft.metadata }),
    };
  }

  #materializeEventChildren(
    children: readonly unknown[],
    owner: string,
  ): readonly EventNode[] {
    assertArray(children, `${owner} children`);

    return children.map((child, index) => {
      if (!isEventNode(child)) {
        throw new IrFactoryError(
          `Invalid event child at ${owner}.children[${index}]. Expected a DSL event node.`,
        );
      }

      return child;
    });
  }

  #materializeConditions(
    conditions: readonly unknown[],
    owner: string,
  ): readonly ConditionNode[] {
    assertArray(conditions, `${owner} conditions`);

    return conditions.map((condition, index) => {
      if (isConditionNode(condition)) {
        return condition;
      }

      if (isConditionDraft(condition)) {
        return this.createCondition(condition);
      }

      throw new IrFactoryError(
        `Invalid condition at ${owner}.conditions[${index}]. Expected a condition descriptor.`,
      );
    });
  }

  #materializeActions(
    actions: readonly unknown[],
    owner: string,
  ): readonly ActionNode[] {
    assertArray(actions, `${owner} actions`);

    return actions.map((action, index) => {
      if (isActionNode(action)) {
        return action;
      }

      if (isActionDraft(action)) {
        return this.createAction(action);
      }

      throw new IrFactoryError(
        `Invalid action at ${owner}.actions[${index}]. Expected an action descriptor.`,
      );
    });
  }

  #resolveInvocationTarget(target: DslTargetRef | undefined): InvocationTarget | undefined {
    if (target === undefined) {
      return undefined;
    }

    assertPlainObject(target, "invocation target");
    assertNonEmptyString(target.objectName, "invocation target objectName");

    const objectRef = this.#projectSnapshot.objectsByName.get(
      target.objectName,
    );

    if (objectRef === undefined) {
      throw new IrFactoryError(formatMissingObjectMessage(target.objectName, this.#projectSnapshot));
    }

    return {
      objectName: objectRef.name,
      objectSid: objectRef.sid,
      ...(target.behaviorId === undefined
        ? {}
        : { behaviorId: target.behaviorId }),
    };
  }
}

function normalizeBlockArgs(
  titleOrOptions: unknown,
  maybeOptions: unknown,
): { readonly label: string; readonly options: BlockOptions } {
  if (maybeOptions === undefined) {
    assertPlainObject(titleOrOptions, "block options");
    return {
      label: "block",
      options: titleOrOptions as BlockOptions,
    };
  }

  assertNonEmptyString(titleOrOptions, "block title");
  assertPlainObject(maybeOptions, `block "${titleOrOptions}" options`);

  const options = maybeOptions as BlockOptions;
  const metadata =
    options.metadata === undefined
      ? { stableKey: titleOrOptions }
      : options.metadata;

  return {
    label: `block "${titleOrOptions}"`,
    options: {
      ...options,
      metadata,
    },
  };
}

function validateInvocationParams(
  params: readonly InvocationParam[],
  owner: string,
): readonly InvocationParam[] {
  assertArray(params, `${owner} params`);

  return params.map((param, index) => {
    assertPlainObject(param, `${owner} params[${index}]`);
    assertNonEmptyString(param.name, `${owner} params[${index}].name`);
    assertConstructValueType(
      param.valueType,
      `${owner} params[${index}].valueType`,
    );

    if (!isConstructJsonValue(param.value)) {
      throw new IrFactoryError(
        `Invalid ${owner} params[${index}].value. Expected a JSON-compatible value.`,
      );
    }

    return param;
  });
}

function assertInvocationDraft(
  draft: InvocationDraft,
  kind: "condition" | "action",
): void {
  assertPlainObject(draft, kind);
  assertNonEmptyString(draft.dictionaryId, `${kind} dictionaryId`);
  assertNonEmptyString(draft.constructId, `${kind} constructId`);
}

function isEventNode(value: unknown): value is EventNode {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    value.eventType === "include" ||
    value.eventType === "comment" ||
    value.eventType === "group" ||
    value.eventType === "block" ||
    value.eventType === "function-block"
  );
}

function isConditionNode(value: unknown): value is ConditionNode {
  return isPlainObject(value) && value.kind === "condition" && "sid" in value;
}

function isActionNode(value: unknown): value is ActionNode {
  return isPlainObject(value) && value.kind === "action" && "sid" in value;
}

function isConditionDraft(value: unknown): value is ConditionDraft {
  return isPlainObject(value) && value.kind === "condition" && !("sid" in value);
}

function isActionDraft(value: unknown): value is ActionDraft {
  return isPlainObject(value) && value.kind === "action" && !("sid" in value);
}

function assertPlainObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new IrFactoryError(`Invalid ${label}. Expected a plain object.`);
  }
}

function assertArray(value: unknown, label: string): asserts value is readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new IrFactoryError(`Invalid ${label}. Expected an array.`);
  }
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string") {
    throw new IrFactoryError(`Invalid ${label}. Expected a string.`);
  }
}

function assertNonEmptyString(
  value: unknown,
  label: string,
): asserts value is string {
  assertString(value, label);

  if (value.length === 0) {
    throw new IrFactoryError(`Invalid ${label}. Expected a non-empty string.`);
  }
}

function assertBoolean(value: unknown, label: string): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new IrFactoryError(`Invalid ${label}. Expected a boolean.`);
  }
}

function assertConstructValueType(
  value: unknown,
  label: string,
): asserts value is ConstructValueType {
  if (
    value !== "boolean" &&
    value !== "number" &&
    value !== "string" &&
    value !== "expression" &&
    value !== "object" &&
    value !== "behavior" &&
    value !== "enum" &&
    value !== "key"
  ) {
    throw new IrFactoryError(`Invalid ${label}. Unknown Construct value type.`);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isConstructJsonValue(value: unknown): value is ConstructJsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isConstructJsonValue);
  }

  if (!isPlainObject(value)) {
    return false;
  }

  return Object.values(value).every(isConstructJsonValue);
}

function formatMissingObjectMessage(
  objectName: string,
  projectSnapshot: ConstructProjectSnapshot,
): string {
  const caseInsensitiveMatch = [...projectSnapshot.objectsByName.keys()].find(
    (knownName) => knownName.toLowerCase() === objectName.toLowerCase(),
  );

  if (caseInsensitiveMatch !== undefined) {
    return [
      `Object "${objectName}" does not exist in objectTypes/.`,
      "Object names are case-sensitive.",
      `Did you mean "${caseInsensitiveMatch}"?`,
      "Compilation aborted before writing any generated files.",
    ].join(" ");
  }

  const knownObjects = [...projectSnapshot.objectsByName.keys()]
    .slice(0, 10)
    .join(", ");
  const suffix =
    knownObjects.length === 0
      ? "No objects were found in objectTypes/."
      : `Known objects: ${knownObjects}.`;

  return [
    `Object "${objectName}" does not exist in objectTypes/.`,
    suffix,
    "Compilation aborted before writing any generated files.",
  ].join(" ");
}
