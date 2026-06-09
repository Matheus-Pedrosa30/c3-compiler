import type { DictionaryModule } from "../core/dictionary/dictionaryTypes.js";
import {
  EightDirectionBehavior,
  eightDirectionBehaviorDefinition,
} from "./behaviors/eightDirection/index.js";
import {
  PlatformBehavior,
  platformBehaviorDefinition,
} from "./behaviors/platform/index.js";
import {
  KeyboardPlugin,
  keyboardPluginDefinition,
} from "./plugins/keyboard/index.js";
import { SystemPlugin, systemPluginDefinition } from "./plugins/system/index.js";
import { SpriteObject, spriteObjectDefinition } from "./objects/spriteObject.js";
import { object, use } from "./bindings/objectBinding.js";

export {
  EightDirectionBehavior,
  KeyboardPlugin,
  PlatformBehavior,
  SpriteObject,
  SystemPlugin,
  object,
  use,
};

export const constructDictionary: DictionaryModule = {
  name: "construct3-core-capabilities",
  version: "0.1.0",
  objects: [spriteObjectDefinition],
  behaviors: [platformBehaviorDefinition, eightDirectionBehaviorDefinition],
  plugins: [systemPluginDefinition, keyboardPluginDefinition],
};
