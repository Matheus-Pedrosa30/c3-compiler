export type ConstructSid = number;

export type ConstructJsonPrimitive = string | number | boolean | null;

export type ConstructJsonValue =
  | ConstructJsonPrimitive
  | ConstructJsonValue[]
  | { readonly [key: string]: ConstructJsonValue };

export type EventNodeType =
  | "include"
  | "comment"
  | "group"
  | "block"
  | "function-block";

export interface SourceLocation {
  readonly filePath?: string;
  readonly line?: number;
  readonly column?: number;
}

export interface IrMetadata {
  readonly source?: SourceLocation;
  readonly stableKey?: string;
}

export interface SidBearingNode {
  readonly sid: ConstructSid;
}

export interface BaseEventNode extends SidBearingNode {
  readonly eventType: EventNodeType;
  readonly metadata?: IrMetadata;
}

export interface IncludeNode extends BaseEventNode {
  readonly eventType: "include";
  readonly includeSheet: string;
}

export interface CommentNode extends BaseEventNode {
  readonly eventType: "comment";
  readonly text: string;
}

export interface GroupNode extends BaseEventNode {
  readonly eventType: "group";
  readonly title: string;
  readonly disabled: boolean;
  readonly isActiveOnStart: boolean;
  readonly children: readonly EventNode[];
}

export interface BlockNode extends BaseEventNode {
  readonly eventType: "block";
  readonly conditions: readonly ConditionNode[];
  readonly actions: readonly ActionNode[];
}

export interface FunctionBlockNode extends BaseEventNode {
  readonly eventType: "function-block";
  readonly name: string;
  readonly parameters: readonly FunctionParameterNode[];
  readonly children: readonly EventNode[];
}

export interface FunctionParameterNode {
  readonly name: string;
  readonly valueType: ConstructValueType;
  readonly defaultValue?: ConstructJsonPrimitive;
}

export interface BaseInvocationNode extends SidBearingNode {
  readonly dictionaryId: string;
  readonly constructId: string;
  readonly target?: InvocationTarget;
  readonly params: readonly InvocationParam[];
  readonly metadata?: IrMetadata;
}

export interface ConditionNode extends BaseInvocationNode {
  readonly kind: "condition";
  readonly isInverted: boolean;
}

export interface ActionNode extends BaseInvocationNode {
  readonly kind: "action";
  readonly disabled?: boolean;
}

export interface InvocationTarget {
  readonly objectName: string;
  readonly objectSid: ConstructSid;
  readonly behaviorId?: string;
}

export interface InvocationParam {
  readonly name: string;
  readonly valueType: ConstructValueType;
  readonly value: ConstructJsonValue;
}

export type ConstructValueType =
  | "boolean"
  | "number"
  | "string"
  | "expression"
  | "object"
  | "behavior"
  | "enum"
  | "key";

export type EventNode =
  | IncludeNode
  | CommentNode
  | GroupNode
  | BlockNode
  | FunctionBlockNode;

export interface SheetIr {
  readonly sheetName: string;
  readonly children: readonly EventNode[];
  readonly metadata?: IrMetadata;
}

export interface ConstructObjectRef {
  readonly name: string;
  readonly sid: ConstructSid;
  readonly objectTypeId: string;
  readonly behaviors: readonly ConstructBehaviorRef[];
}

export interface ConstructBehaviorRef {
  readonly behaviorId: string;
  readonly name: string;
  readonly sid: ConstructSid;
}

export interface ConstructProjectSnapshot {
  readonly projectRoot: string;
  readonly objectTypesDir: string;
  readonly objectsByName: ReadonlyMap<string, ConstructObjectRef>;
  readonly usedSids: ReadonlySet<ConstructSid>;
}
