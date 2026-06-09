import type {
  ActionNode,
  ConditionNode,
  ConstructJsonValue,
  ConstructObjectRef,
  ConstructValueType,
  InvocationParam,
} from "../ir/irTypes.js";

export type DictionaryId = string;
export type ObjectTypeId = string;
export type BehaviorId = string;
export type PluginId = string;
export type InvocationId = string;
export type ParamName = string;

export interface DictionaryModule {
  readonly name: string;
  readonly version: string;
  readonly objects?: readonly ObjectTypeDefinition[];
  readonly behaviors?: readonly BehaviorDefinition[];
  readonly plugins?: readonly PluginDefinition[];
  readonly paramEncoders?: readonly ParamEncoderDefinition[];
}

export interface ObjectTypeDefinition {
  readonly id: ObjectTypeId;
  readonly constructType: string;
  readonly allowedBehaviors?: readonly BehaviorId[];
}

export interface BehaviorDefinition {
  readonly id: BehaviorId;
  readonly constructName: string;
  readonly conditions?: readonly ConditionDefinition[];
  readonly actions?: readonly ActionDefinition[];
  readonly allowedObjectTypes?: readonly ObjectTypeId[];
}

export interface PluginDefinition {
  readonly id: PluginId;
  readonly constructName: string;
  readonly conditions?: readonly ConditionDefinition[];
  readonly actions?: readonly ActionDefinition[];
}

export interface InvocationDefinition {
  readonly id: InvocationId;
  readonly constructId: string;
  readonly params: readonly ParamDefinition[];
}

export interface ConditionDefinition extends InvocationDefinition {
  readonly kind: "condition";
}

export interface ActionDefinition extends InvocationDefinition {
  readonly kind: "action";
}

export interface ParamDefinition {
  readonly name: ParamName;
  readonly valueType: ConstructValueType;
  readonly required: boolean;
  readonly encoderId?: string;
}

export interface ParamEncoderDefinition {
  readonly id: string;
  readonly inputType: ConstructValueType;
  readonly outputType: ConstructValueType;
  readonly encode: ParamEncoder;
}

export type ParamEncoder = (input: ParamEncoderInput) => ParamEncoderResult;

export interface ParamEncoderInput {
  readonly param: ParamDefinition;
  readonly value: unknown;
}

export type ParamEncoderResult =
  | { readonly ok: true; readonly value: ConstructJsonValue }
  | { readonly ok: false; readonly message: string };

export interface ObjectBinding {
  readonly object: ConstructObjectRef;
  readonly objectTypeId: ObjectTypeId;
  readonly behaviors: readonly BehaviorBinding[];
}

export interface BehaviorBinding {
  readonly behaviorId: BehaviorId;
  readonly constructName: string;
}

export interface BoundConditionDescriptor {
  readonly kind: "condition";
  readonly dictionaryId: DictionaryId;
  readonly definition: ConditionDefinition;
  readonly target?: ObjectBinding;
  readonly behaviorId?: BehaviorId;
  readonly params: readonly InvocationParam[];
  readonly toIr: () => ConditionNode;
}

export interface BoundActionDescriptor {
  readonly kind: "action";
  readonly dictionaryId: DictionaryId;
  readonly definition: ActionDefinition;
  readonly target?: ObjectBinding;
  readonly behaviorId?: BehaviorId;
  readonly params: readonly InvocationParam[];
  readonly toIr: () => ActionNode;
}

export type BoundInvocationDescriptor =
  | BoundConditionDescriptor
  | BoundActionDescriptor;

export interface DictionaryRegistry {
  readonly modules: readonly DictionaryModule[];
  getObjectType(id: ObjectTypeId): ObjectTypeDefinition | undefined;
  getBehavior(id: BehaviorId): BehaviorDefinition | undefined;
  getPlugin(id: PluginId): PluginDefinition | undefined;
  getParamEncoder(id: string): ParamEncoderDefinition | undefined;
}

export interface DictionaryLoader {
  load(paths: readonly string[]): Promise<readonly DictionaryModule[]>;
}

export interface ObjectCatalog {
  readonly objectsByName: ReadonlyMap<string, ConstructObjectRef>;
  requireExistingObject(name: string): ConstructObjectRef;
}
