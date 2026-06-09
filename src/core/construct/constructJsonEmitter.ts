import type { SidAllocator } from "../sid/sidAllocator.js";
import type {
  ActionNode,
  BlockNode,
  CommentNode,
  ConditionNode,
  ConstructJsonValue,
  ConstructSid,
  EventNode,
  FunctionBlockNode,
  GroupNode,
  IncludeNode,
  InvocationParam,
  SheetIr,
} from "../ir/irTypes.js";

export type ConstructEventSheetJson = {
  name: string;
  events: readonly ConstructEventJson[];
  sid: ConstructSid;
};

export type ConstructEventJson =
  | ConstructIncludeJson
  | ConstructCommentJson
  | ConstructGroupJson
  | ConstructBlockJson
  | ConstructFunctionBlockJson;

export interface ConstructIncludeJson {
  eventType: "include";
  includeSheet: string;
}

export interface ConstructCommentJson {
  eventType: "comment";
  text: string;
}

export interface ConstructGroupJson {
  eventType: "group";
  disabled: boolean;
  title: string;
  description: string;
  isActiveOnStart: boolean;
  children: readonly ConstructEventJson[];
  sid: ConstructSid;
}

export interface ConstructBlockJson {
  eventType: "block";
  conditions: readonly ConstructConditionJson[];
  actions: readonly ConstructActionJson[];
  sid: ConstructSid;
}

export interface ConstructFunctionBlockJson {
  functionName: string;
  functionDescription: string;
  functionCategory: string;
  functionReturnType: "none";
  functionCopyPicked: boolean;
  functionIsAsync: boolean;
  functionParameters: readonly ConstructFunctionParameterJson[];
  eventType: "function-block";
  conditions: readonly ConstructConditionJson[];
  actions: readonly ConstructActionJson[];
  sid: ConstructSid;
}

export interface ConstructFunctionParameterJson {
  name: string;
  type: string;
  initialValue?: ConstructJsonValue;
}

export interface ConstructConditionJson {
  id: string;
  objectClass: string;
  sid: ConstructSid;
  behaviorType?: string;
  parameters?: Record<string, ConstructJsonValue>;
  isInverted?: true;
}

export interface ConstructActionJson {
  id: string;
  objectClass: string;
  sid: ConstructSid;
  disabled?: true;
  behaviorType?: string;
  parameters?: Record<string, ConstructJsonValue>;
}

export interface EmitEventSheetOptions {
  readonly sheetSid?: ConstructSid;
}

export class ConstructJsonEmitterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConstructJsonEmitterError";
  }
}

export class ConstructJsonEmitter {
  readonly #sidAllocator: SidAllocator;

  constructor(sidAllocator: SidAllocator) {
    this.#sidAllocator = sidAllocator;
  }

  emitEventSheet(
    sheet: SheetIr,
    options: EmitEventSheetOptions = {},
  ): ConstructEventSheetJson {
    assertValidSheet(sheet);

    return {
      name: sheet.sheetName,
      events: sheet.children.map((eventNode) => this.#emitEvent(eventNode)),
      sid: options.sheetSid ?? this.#sidAllocator.allocate(),
    };
  }

  serializeEventSheet(
    sheet: SheetIr,
    options: EmitEventSheetOptions = {},
  ): string {
    return `${JSON.stringify(this.emitEventSheet(sheet, options), null, "\t")}\n`;
  }

  #emitEvent(eventNode: EventNode): ConstructEventJson {
    switch (eventNode.eventType) {
      case "include":
        return emitInclude(eventNode);
      case "comment":
        return emitComment(eventNode);
      case "group":
        return this.#emitGroup(eventNode);
      case "block":
        return emitBlock(eventNode);
      case "function-block":
        return emitFunctionBlock(eventNode);
    }
  }

  #emitGroup(group: GroupNode): ConstructGroupJson {
    return {
      eventType: "group",
      disabled: group.disabled,
      title: group.title,
      description: "",
      isActiveOnStart: group.isActiveOnStart,
      children: group.children.map((child) => this.#emitEvent(child)),
      sid: group.sid,
    };
  }
}

export function emitEventSheetJson(
  sheet: SheetIr,
  sidAllocator: SidAllocator,
  options?: EmitEventSheetOptions,
): ConstructEventSheetJson {
  return new ConstructJsonEmitter(sidAllocator).emitEventSheet(sheet, options);
}

export function serializeEventSheetJson(
  sheet: SheetIr,
  sidAllocator: SidAllocator,
  options?: EmitEventSheetOptions,
): string {
  return new ConstructJsonEmitter(sidAllocator).serializeEventSheet(
    sheet,
    options,
  );
}

function emitInclude(include: IncludeNode): ConstructIncludeJson {
  return {
    eventType: "include",
    includeSheet: include.includeSheet,
  };
}

function emitComment(comment: CommentNode): ConstructCommentJson {
  return {
    eventType: "comment",
    text: comment.text,
  };
}

function emitBlock(block: BlockNode): ConstructBlockJson {
  return {
    eventType: "block",
    conditions: block.conditions.map(emitCondition),
    actions: block.actions.map(emitAction),
    sid: block.sid,
  };
}

function emitFunctionBlock(
  functionBlock: FunctionBlockNode,
): ConstructFunctionBlockJson {
  return {
    functionName: functionBlock.name,
    functionDescription: "",
    functionCategory: "",
    functionReturnType: "none",
    functionCopyPicked: false,
    functionIsAsync: false,
    functionParameters: functionBlock.parameters.map((parameter) => {
      const emittedParameter: ConstructFunctionParameterJson = {
        name: parameter.name,
        type: parameter.valueType,
      };

      if (parameter.defaultValue !== undefined) {
        emittedParameter.initialValue = parameter.defaultValue;
      }

      return emittedParameter;
    }),
    eventType: "function-block",
    conditions: [],
    actions: [],
    sid: functionBlock.sid,
  };
}

function emitCondition(condition: ConditionNode): ConstructConditionJson {
  const emittedCondition: ConstructConditionJson = {
    id: condition.constructId,
    objectClass: getObjectClass(condition),
    sid: condition.sid,
  };

  applyBehaviorType(emittedCondition, condition);
  applyParameters(emittedCondition, condition.params);

  if (condition.isInverted) {
    emittedCondition.isInverted = true;
  }

  return emittedCondition;
}

function emitAction(action: ActionNode): ConstructActionJson {
  const emittedAction: ConstructActionJson = {
    id: action.constructId,
    objectClass: getObjectClass(action),
    sid: action.sid,
  };

  if (action.disabled === true) {
    emittedAction.disabled = true;
  }

  applyBehaviorType(emittedAction, action);
  applyParameters(emittedAction, action.params);

  return emittedAction;
}

function getObjectClass(invocation: ConditionNode | ActionNode): string {
  return invocation.target?.objectName ?? invocation.dictionaryId;
}

function applyBehaviorType(
  output: ConstructConditionJson | ConstructActionJson,
  invocation: ConditionNode | ActionNode,
): void {
  if (invocation.target?.behaviorId !== undefined) {
    output.behaviorType = invocation.target.behaviorId;
  }
}

function applyParameters(
  output: ConstructConditionJson | ConstructActionJson,
  params: readonly InvocationParam[],
): void {
  if (params.length === 0) {
    return;
  }

  output.parameters = Object.fromEntries(
    params.map((param) => [param.name, param.value]),
  );
}

function assertValidSheet(sheet: SheetIr): void {
  if (sheet.sheetName.length === 0) {
    throw new ConstructJsonEmitterError(
      "Cannot emit an event sheet with an empty name.",
    );
  }
}
