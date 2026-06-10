import type { ActionDraft } from "../../../core/ir/irFactory.js";
import type { InvocationParam } from "../../../core/ir/irTypes.js";

export interface ObjectNameRef {
  readonly name: string;
}

export interface CreateObjectOptions {
  readonly createHierarchy?: boolean;
  readonly templateName?: string;
}

export function createObject(
  objectToCreate: string | ObjectNameRef,
  layer: string | number,
  x: string | number,
  y: string | number,
  options: CreateObjectOptions = {},
): ActionDraft {
  return {
    kind: "action",
    dictionaryId: "System",
    constructId: "create-object",
    params: createObjectParams(objectToCreate, layer, x, y, options),
  };
}

function createObjectParams(
  objectToCreate: string | ObjectNameRef,
  layer: string | number,
  x: string | number,
  y: string | number,
  options: CreateObjectOptions,
): readonly InvocationParam[] {
  return [
    {
      name: "object-to-create",
      valueType: "object",
      value: typeof objectToCreate === "string" ? objectToCreate : objectToCreate.name,
    },
    {
      name: "layer",
      valueType: typeof layer === "number" ? "number" : "expression",
      value: layer,
    },
    {
      name: "x",
      valueType: typeof x === "number" ? "number" : "expression",
      value: x,
    },
    {
      name: "y",
      valueType: typeof y === "number" ? "number" : "expression",
      value: y,
    },
    {
      name: "create-hierarchy",
      valueType: "boolean",
      value: options.createHierarchy ?? false,
    },
    {
      name: "template-name",
      valueType: "string",
      value: options.templateName ?? "",
    },
  ];
}
