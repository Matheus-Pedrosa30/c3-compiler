import type { ActionDraft } from "../../../core/ir/irFactory.js";
import type { InvocationParam } from "../../../core/ir/irTypes.js";

export class SystemActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SystemActionError";
  }
}

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
  assertCreateObjectTarget(objectToCreate);
  assertFiniteLayerIndex(layer);
  assertCoordinate(x, "System.createObject x");
  assertCoordinate(y, "System.createObject y");
  assertCreateObjectOptions(options);

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
      value: normalizeObjectName(objectToCreate),
    },
    {
      name: "layer",
      valueType: "expression",
      value: normalizeLayerIndex(layer),
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
      value: normalizeTemplateName(options.templateName),
    },
  ];
}

function normalizeObjectName(objectToCreate: string | ObjectNameRef): string {
  return typeof objectToCreate === "string" ? objectToCreate : objectToCreate.name;
}

function assertCreateObjectTarget(
  objectToCreate: string | ObjectNameRef,
): void {
  const objectName = normalizeObjectName(objectToCreate);

  if (typeof objectName !== "string" || objectName.length === 0) {
    throw new SystemActionError(
      "System.createObject objectToCreate must resolve to a non-empty Construct object name.",
    );
  }
}

function assertFiniteLayerIndex(layer: string | number): void {
  const normalizedLayer = normalizeLayerIndex(layer);
  const layerIndex = Number(normalizedLayer);

  if (!Number.isInteger(layerIndex) || layerIndex < 0) {
    throw new SystemActionError(
      [
        `Invalid System.createObject layer "${String(layer)}".`,
        `Construct persists this parameter as a numeric layer index string, e.g. "0", "1", "2".`,
        `Do not pass layer names such as "Player" or quoted string literals such as "\\"Player\\"".`,
      ].join(" "),
    );
  }
}

function normalizeLayerIndex(layer: string | number): string {
  if (typeof layer === "number") {
    return String(layer);
  }

  return layer;
}

function assertCoordinate(value: string | number, label: string): void {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SystemActionError(`${label} must be a finite number.`);
    }

    return;
  }

  if (typeof value !== "string" || value.length === 0) {
    throw new SystemActionError(
      `${label} must be a non-empty Construct expression string or a finite number.`,
    );
  }
}

function assertCreateObjectOptions(options: CreateObjectOptions): void {
  if (typeof options !== "object" || options === null || Array.isArray(options)) {
    throw new SystemActionError(
      "System.createObject options must be a plain object when provided.",
    );
  }

  if (
    options.createHierarchy !== undefined &&
    typeof options.createHierarchy !== "boolean"
  ) {
    throw new SystemActionError(
      "System.createObject options.createHierarchy must be boolean.",
    );
  }

  if (
    options.templateName !== undefined &&
    typeof options.templateName !== "string"
  ) {
    throw new SystemActionError(
      "System.createObject options.templateName must be a Construct string literal expression.",
    );
  }
}

function normalizeTemplateName(templateName: string | undefined): string {
  return templateName ?? "\"\"";
}
