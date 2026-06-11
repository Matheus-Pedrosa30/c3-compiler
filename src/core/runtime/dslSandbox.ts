import vm from "node:vm";
import type { IrFactory } from "../ir/irFactory.js";
import type { GroupNode, IncludeNode, CommentNode, BlockNode, FunctionBlockNode, SheetIr } from "../ir/irTypes.js";

export interface DslSandboxGlobals {
  readonly sheet: (sheetName: unknown, children: readonly unknown[]) => SheetIr;
  readonly group: (title: unknown, options?: unknown) => GroupNode;
  readonly block: (titleOrOptions?: unknown, maybeOptions?: unknown) => BlockNode;
  readonly include: (includeSheet: unknown) => IncludeNode;
  readonly comment: (text: unknown) => CommentNode;
  readonly functionBlock: (name: unknown, options?: unknown) => FunctionBlockNode;
}

export interface DslSandbox {
  readonly context: vm.Context;
  readonly globals: DslSandboxGlobals;
}

export function createDslSandbox(
  irFactory: IrFactory,
  onSheet: (sheet: SheetIr) => void,
  extraGlobals: Record<string, unknown> = {},
): DslSandbox {
  const globals: DslSandboxGlobals = Object.freeze({
    sheet: (sheetName: unknown, children: readonly unknown[]): SheetIr => {
      const sheetIr = irFactory.createSheet(sheetName, children);
      onSheet(sheetIr);
      return sheetIr;
    },
    group: (title: unknown, options?: unknown): GroupNode =>
      irFactory.createGroup(title, options),
    block: (titleOrOptions?: unknown, maybeOptions?: unknown): BlockNode =>
      irFactory.createBlock(titleOrOptions, maybeOptions),
    include: (includeSheet: unknown): IncludeNode =>
      irFactory.createInclude(includeSheet),
    comment: (text: unknown): CommentNode => irFactory.createComment(text),
    functionBlock: (name: unknown, options?: unknown): FunctionBlockNode =>
      irFactory.createFunctionBlock(name, options),
  });

  const context = vm.createContext(
    Object.freeze({
      ...globals,
      ...extraGlobals,
    }),
    {
      name: "c3-dsl-sandbox",
      origin: "c3-compiler",
    },
  );

  return {
    context,
    globals,
  };
}
