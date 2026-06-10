# Roadmap tecnico do c3-compiler

Este arquivo e o backlog operacional do projeto. Ele deve orientar a expansao do `src/dictionary/` sem violar a arquitetura aprovada:

- O `src/core/` permanece agnostico.
- O `src/dictionary/` contem vocabulario Construct 3.
- Behaviors sao capacidades reutilizaveis e acopladas por composicao tardia via `use(...)`, `.check(...)` e `.execute(...)`.
- Objetos da DSL devem existir no projeto Construct, dentro de `objectTypes/`.
- Nenhuma task deve introduzir SIDs manuais na DSL.

## Status atual do MVP

- [x] Core agnostico de compilacao.
- [x] Reader do projeto Construct com varredura recursiva de JSON.
- [x] Suporte a projeto virgem sem `objectTypes/`.
- [x] Ignorar `.uistate.json` e diretorios `uistate/`.
- [x] Catalogo case-sensitive de objetos existentes.
- [x] Registro e alocacao sequencial alta de SIDs.
- [x] Sandbox isolado via `node:vm`.
- [x] Injecao plugavel de globais do dicionario via `dictionaryRuntimeGlobals`.
- [x] IR Factory para `sheet`, `group`, `block`, `include`, `comment`, `functionBlock`, conditions e actions.
- [x] Emitter de Event Sheet no formato persistido do Construct: `name`, `events`, `sid`.
- [x] Escrita atomica de JSON via arquivo temporario e `rename`.
- [x] Sincronizacao atomica de `project.c3proj`.
- [x] CLI explicita estilo GCC com `-i`, `-p`, `-o`.
- [x] Exemplo real `src/scripts/playerController.c3dsl.ts`.
- [x] Documentacao principal `README.md`.
- [x] Instrucoes para agentes `llm-instructions.md`.

## Regras permanentes para qualquer item do roadmap

- [ ] Antes de adicionar uma action/condition, confirmar o ID persistido em JSON real do Construct.
- [ ] Manter cada plugin em `src/dictionary/plugins/<plugin>/`.
- [ ] Manter cada behavior em `src/dictionary/behaviors/<behavior>/`.
- [ ] Nao hardcodar nomes de objetos como `player`, `camera`, `enemy` dentro de plugins ou behaviors.
- [ ] Toda action de behavior deve gerar descriptor com `behaviorType`.
- [ ] Toda action de objeto deve gerar descriptor sem `behaviorType`.
- [ ] Toda condition/action global deve usar `dictionaryId` igual ao `objectClass` persistido, por exemplo `System`, `Keyboard`, `Mouse`.
- [ ] Todo parametro deve declarar `name`, `valueType` e `value` de forma compativel com o JSON real.
- [ ] Todo novo modulo deve ser exportado em `src/dictionary/index.ts`.
- [ ] Todo novo simbolo publico deve entrar em `dictionaryRuntimeGlobals` quando for parte da DSL.
- [ ] Rodar `npm run typecheck` antes de considerar uma task concluida.
- [ ] Quando possivel, testar compilando uma DSL contra `/home/matheusp/Projetos/construct3`.

## Fase 1: endurecimento do dicionario atual

### System plugin (`src/dictionary/plugins/system/`)

Status implementado:

- [x] `else`
- [x] `every-tick`
- [x] `on-start-of-layout`
- [x] `compare-two-values`
- [x] Persistencia forte de `compare-two-values.comparison` como codigos numericos `0..5`.
- [x] `create-object`
- [x] Persistencia forte de `create-object.layer` como string numerica, ex: `"2"`.

Pendencias imediatas:

- [ ] Criar aliases ergonomicos sem alterar IDs persistidos: `SystemPlugin.otherwise`, `SystemPlugin.compare`.
- [ ] Adicionar testes/fixtures para cada condition atual.
- [ ] Adicionar actions de variaveis globais/locais:
  - [ ] `set-value`
  - [ ] `add-to`
  - [ ] `subtract-from`
  - [ ] `toggle-boolean`
- [ ] Adicionar controle de layout:
  - [ ] `restart-layout`
  - [ ] `go-to-layout`
  - [ ] `go-to-layout-by-name`
  - [ ] `next-layout`
  - [ ] `previous-layout`
- [ ] Adicionar controle de layer:
  - [ ] `set-layer-visible`
  - [ ] `set-layer-opacity`
  - [ ] `set-layer-scale`
  - [ ] `set-layer-angle`
  - [ ] `set-layer-background`
- [ ] Adicionar tempo:
  - [ ] `every-x-seconds`
  - [ ] `wait`
  - [ ] `set-time-scale`
  - [ ] `compare-time`
- [ ] Adicionar controle de objetos:
  - [x] `create-object`
  - [ ] `create-object-by-name`
  - [ ] `pick-all`
  - [ ] `pick-by-comparison`
  - [ ] `pick-random-instance`

### Keyboard plugin (`src/dictionary/plugins/keyboard/`)

Status implementado:

- [x] `key-is-down`
- [x] `on-key-pressed`
- [x] Conversor humano para KeyCode em `src/dictionary/params/keyCodes.ts`.

Pendencias:

- [ ] Adicionar `on-key-released`.
- [ ] Adicionar `on-any-key-pressed`.
- [ ] Adicionar `on-any-key-released`.
- [ ] Adicionar expressions de tecla quando existirem no JSON real.
- [ ] Validar nomes alternativos de teclas comuns:
  - [ ] `Ctrl` alias de `Control`
  - [ ] `Esc` alias de `Escape`
  - [ ] `Left` alias de `ArrowLeft`
  - [ ] `Right` alias de `ArrowRight`
  - [ ] `Up` alias de `ArrowUp`
  - [ ] `Down` alias de `ArrowDown`

### Mouse plugin (`src/dictionary/plugins/mouse/`)

Status implementado:

- [x] `cursor-is-over-object`
- [x] `set-cursor-style2`

Pendencias:

- [ ] Confirmar IDs persistidos de cliques em JSON real.
- [ ] Adicionar conditions:
  - [ ] `on-click`
  - [ ] `on-object-clicked`
  - [ ] `mouse-button-is-down`
  - [ ] `on-button-released`
  - [ ] `cursor-is-over-object`
- [ ] Adicionar actions:
  - [ ] `set-cursor-style2` com enum completo de cursores.
- [ ] Adicionar expressions ergonomicas:
  - [ ] `MousePlugin.X`
  - [ ] `MousePlugin.Y`
  - [ ] `MousePlugin.AbsoluteX`
  - [ ] `MousePlugin.AbsoluteY`
- [ ] Decidir padrao de expressions no dicionario: string literal simples ou objeto expression tipado.

### SpriteObject (`src/dictionary/objects/spriteObject.ts`)

Status implementado:

- [x] `set-animation-speed`
- [x] `set-animation-frame`
- [x] `set-animation`
- [x] `set-instvar-value`
- [x] `set-position`
- [x] `set-mirrored`

Pendencias:

- [ ] Confirmar parametro real de `set-mirrored` no JSON do Construct.
- [ ] Adicionar `set-flipped`.
- [ ] Adicionar transformacoes:
  - [ ] `set-x`
  - [ ] `set-y`
  - [ ] `set-position`
  - [ ] `set-width`
  - [ ] `set-height`
  - [ ] `set-size`
  - [ ] `set-scale`
  - [ ] `set-angle`
  - [ ] `rotate-clockwise`
  - [ ] `rotate-counter-clockwise`
- [ ] Adicionar visibilidade/opacidade:
  - [ ] `set-visible`
  - [ ] `set-opacity`
  - [ ] `set-blend-mode`
- [ ] Adicionar lifecycle:
  - [ ] `destroy`
  - [ ] `spawn-another-object`
- [ ] Adicionar Z order:
  - [ ] `move-to-top`
  - [ ] `move-to-bottom`
  - [ ] `move-to-layer`
  - [ ] `move-forward`
  - [ ] `move-backward`
- [ ] Adicionar conditions:
  - [ ] `is-visible`
  - [ ] `is-on-screen`
  - [ ] `is-outside-layout`
  - [ ] `on-created`
  - [ ] `on-destroyed`
  - [ ] `on-collision-with`
  - [ ] `is-overlapping-another-object`
  - [ ] `on-animation-finished`
  - [ ] `is-playing`
  - [ ] `compare-frame`
  - [ ] `compare-animation`
- [ ] Adicionar expressions:
  - [ ] `X`
  - [ ] `Y`
  - [ ] `Width`
  - [ ] `Height`
  - [ ] `Angle`
  - [ ] `Opacity`
  - [ ] `AnimationName`
  - [ ] `AnimationFrame`
  - [ ] `IID`
  - [ ] `UID`

## Fase 2: catalogo nativo de plugins globais

Use esta tabela como fonte de planejamento. Cada linha deve virar um modulo ou uma decisao explicita de nao suportar ainda.

| Nome na IDE | ID estrito | Escopo | Status |
| --- | --- | --- | --- |
| System | `System` | Controle de fluxo, variaveis, tempo e layouts | [x] Parcial |
| Keyboard | `Keyboard` | Captura de teclas fisicas | [x] Parcial |
| Mouse | `Mouse` | Posicao e cliques do ponteiro | [x] Parcial |
| Touch | `Touch` | Toque, gestos e mobile | [ ] Nao iniciado |
| Audio | `Audio` | Canais de som, efeitos e musica | [ ] Nao iniciado |
| Browser | `Browser` | Pagina web, cookies, URLs e tela cheia | [ ] Nao iniciado |
| LocalStorage | `LocalStorage` | Persistencia local | [ ] Nao iniciado |
| Gamepad | `Gamepad` | Controles fisicos | [ ] Nao iniciado |
| Array | `Array` | Estrutura indexada X/Y/Z | [ ] Nao iniciado |
| Dictionary | `Dictionary` | Estrutura chave-valor | [ ] Nao iniciado |
| JSON | `JSON` | Parse e manipulacao de JSON | [ ] Nao iniciado |
| Platform Info | `PlatformInfo` | SO, ambiente e performance | [ ] Nao iniciado |
| Function | `Function` | Funcoes classicas/legadas | [ ] Nao iniciado |
| AJAX | `AJAX` | HTTP e carregamento externo | [ ] Nao iniciado |
| User Media | `UserMedia` | Camera, microfone, fala | [ ] Nao iniciado |
| Advanced Random | `AdvancedRandom` | Random avancado, ruido, seed | [ ] Nao iniciado |
| Binary Data | `BinaryData` | Buffers e binarios | [ ] Nao iniciado |
| Date | `Date` | Tempo, calendario, timestamps | [ ] Nao iniciado |

### Touch (`src/dictionary/plugins/touch/`)

- [ ] Criar modulo `touch/`.
- [ ] Mapear conditions:
  - [ ] toque iniciado
  - [ ] toque encerrado
  - [ ] qualquer toque
  - [ ] toque sobre objeto
  - [ ] gesto reconhecido
- [ ] Mapear expressions:
  - [ ] `Touch.X`
  - [ ] `Touch.Y`
  - [ ] `Touch.AbsoluteX`
  - [ ] `Touch.AbsoluteY`
  - [ ] contagem de toques

### Audio (`src/dictionary/plugins/audio/`)

- [ ] Criar modulo `audio/`.
- [ ] Mapear actions:
  - [ ] play
  - [ ] stop
  - [ ] stop-all
  - [ ] set-volume
  - [ ] set-master-volume
  - [ ] set-muted
  - [ ] preload
  - [ ] fade-volume
- [ ] Mapear conditions:
  - [ ] on-ended
  - [ ] is-playing
  - [ ] is-muted
- [ ] Mapear parametros de tag/canal de forma tipada.

### Browser (`src/dictionary/plugins/browser/`)

- [ ] Criar modulo `browser/`.
- [ ] Mapear actions:
  - [ ] go-to-url
  - [ ] reload
  - [ ] request-fullscreen
  - [ ] cancel-fullscreen
  - [ ] alert
  - [ ] console-log
- [ ] Mapear conditions:
  - [ ] on-resized
  - [ ] is-fullscreen
  - [ ] online/offline

### LocalStorage (`src/dictionary/plugins/localStorage/`)

- [ ] Criar modulo `localStorage/`.
- [ ] Mapear actions:
  - [ ] set-item
  - [ ] get-item
  - [ ] remove-item
  - [ ] clear
- [ ] Mapear triggers:
  - [ ] on-item-set
  - [ ] on-item-get
  - [ ] on-error
- [ ] Definir padrao de callbacks/event blocks para respostas assinc.

### Gamepad (`src/dictionary/plugins/gamepad/`)

- [ ] Criar modulo `gamepad/`.
- [ ] Mapear conditions:
  - [ ] button-is-down
  - [ ] on-button-pressed
  - [ ] on-button-released
  - [ ] gamepad-connected
- [ ] Mapear expressions:
  - [ ] axis
  - [ ] button-value
  - [ ] gamepad-count

### Estruturas de dados: Array, Dictionary e JSON

- [ ] Criar `plugins/array/`.
- [ ] Criar `plugins/dictionary/`.
- [ ] Criar `plugins/json/`.
- [ ] Definir convencao para instancias globais versus object types existentes.
- [ ] Mapear actions basicas de leitura/escrita.
- [ ] Mapear expressions de acesso.
- [ ] Criar exemplos de inventario, flags de quest e save data.

### AJAX, UserMedia, AdvancedRandom, BinaryData, Date, PlatformInfo, Function

- [ ] Criar modulos individuais.
- [ ] Para cada modulo, primeiro extrair JSON real de uma folha minima no Construct.
- [ ] Documentar IDs persistidos antes de implementar helpers de DSL.
- [ ] Adicionar ao `dictionaryRuntimeGlobals` apenas quando houver API publica utilizavel.

## Fase 3: catalogo nativo de behaviors

Use esta tabela como backlog de modulos em `src/dictionary/behaviors/`.

### Grupo: movimentacao

| Nome na IDE | ID estrito | Descricao | Status |
| --- | --- | --- | --- |
| Platform | `Platform` | Gravidade lateral, pulo, corrida e plataformas | [x] Parcial |
| 8 Direction | `8Direction` | Movimento top-down em 8 eixos | [x] Parcial |
| Bullet | `Bullet` | Movimento reto de projetil | [ ] Nao iniciado |
| Car | `Car` | Fisica de veiculo | [ ] Nao iniciado |
| Pathfinding | `Pathfinding` | Rota e desvio de obstaculos | [ ] Nao iniciado |
| Custom Movement | `CustomMovement` | Vetores manuais de velocidade/aceleracao | [ ] Nao iniciado |
| Grid Movement | `GridMovement` | Movimento em grade | [ ] Nao iniciado |
| Turret | `Turret` | Rastreamento e mira automatica | [ ] Nao iniciado |

### Grupo: geometria e posicionamento

| Nome na IDE | ID estrito | Descricao | Status |
| --- | --- | --- | --- |
| Pin | `Pin` | Fixa objeto em outro | [x] Parcial |
| Anchor | `Anchor` | Ancora UI em bordas da tela | [ ] Nao iniciado |
| Bound to Layout | `BoundToLayout` | Mantem objeto dentro do layout | [ ] Nao iniciado |
| Scroll To | `ScrollTo` | Centraliza camera no objeto | [ ] Nao iniciado |
| Wrap | `Wrap` | Teleporta ao sair das bordas | [ ] Nao iniciado |
| Tile Movement | `TileMovement` | Movimento restrito por tiles | [ ] Nao iniciado |

### Grupo: visuais e tweens

| Nome na IDE | ID estrito | Descricao | Status |
| --- | --- | --- | --- |
| Fade | `Fade` | Controle gradual de opacidade | [ ] Nao iniciado |
| Flash | `Flash` | Pisca visibilidade | [ ] Nao iniciado |
| Sine | `Sine` | Oscilacao senoidal | [ ] Nao iniciado |
| Tween | `Tween` | Interpolacao por easing | [ ] Nao iniciado |
| Shadow Caster | `ShadowCaster` | Bloqueia/projeta sombras 2D | [ ] Nao iniciado |
| Line-of-Sight | `LineOfSight` | Campo de visao/deteccao | [ ] Nao iniciado |

### Grupo: dados e avancados

| Nome na IDE | ID estrito | Descricao | Status |
| --- | --- | --- | --- |
| Physics | `Physics` | Fisica 2D rigida | [ ] Nao iniciado |
| Persist | `Persist` | Persiste estado entre layouts | [ ] Nao iniciado |
| Destroy Outside Layout | `DestroyOutsideLayout` | Destroi fora do layout | [ ] Nao iniciado |
| Timer | `Timer` | Timers locais por instancia | [ ] Nao iniciado |
| Move To | `MoveTo` | Move em direcao a ponto X/Y | [ ] Nao iniciado |

### Platform (`src/dictionary/behaviors/platform/`)

Status implementado:

- [x] `simulate-control`
- [x] `is-moving`

Pendencias:

- [ ] Implementar `is-on-floor`.
- [ ] Implementar `is-by-wall`.
- [ ] Implementar `is-jumping`.
- [ ] Implementar `is-falling`.
- [ ] Implementar `on-land`.
- [ ] Implementar `simulate-control` com enum completo:
  - [ ] `left`
  - [ ] `right`
  - [ ] `jump`
- [ ] Implementar actions de fisica:
  - [ ] `set-max-speed`
  - [ ] `set-acceleration`
  - [ ] `set-deceleration`
  - [ ] `set-jump-strength`
  - [ ] `set-gravity`
  - [ ] `set-vector-x`
  - [ ] `set-vector-y`

### 8Direction (`src/dictionary/behaviors/eightDirection/`)

Status implementado:

- [x] `simulate-control`
- [x] `is-moving`

Pendencias:

- [ ] Confirmar ID real do behavior no objectTypes: `EightDir` versus nome persistido `8Direction`.
- [ ] Implementar directions completas:
  - [x] `up`
  - [x] `down`
  - [x] `left`
  - [x] `right`
  - [ ] diagonais, se suportadas pelo Construct.
- [ ] Implementar conditions:
  - [ ] compare-speed
  - [ ] is-enabled
- [ ] Implementar actions:
  - [ ] `set-max-speed`
  - [ ] `set-acceleration`
  - [ ] `set-deceleration`
  - [ ] `set-enabled`
  - [ ] `set-vector-x`
  - [ ] `set-vector-y`

### Pin (`src/dictionary/behaviors/pin/`)

Status implementado:

- [x] `pin-to-object-properties`

Pendencias:

- [ ] Implementar `unpin`.
- [ ] Implementar condition `is-pinned`, se existir.
- [ ] Confirmar enums reais para width/height/angle mode.
- [ ] Criar helper ergonomico `PinBehavior.pinTo(objectName)` para caso comum.

### Bullet (`src/dictionary/behaviors/bullet/`)

- [x] Criar modulo.
- [x] Exportar `BulletBehavior` em `src/dictionary/index.ts`.
- [x] Injetar `BulletBehavior` em `dictionaryRuntimeGlobals`.
- [x] Registrar `bulletBehaviorDefinition` em `constructDictionary`.
- [x] Implementar actions:
  - [x] `set-speed`
  - [x] `set-acceleration`
  - [x] `set-angle-of-motion`
  - [x] `bounce-off-object`
  - [x] `set-enabled`
- [x] Implementar conditions:
  - [x] `compare-speed`
  - [x] `compare-distance-travelled`
  - [x] `is-enabled`
- [ ] Confirmar IDs e nomes de parametros contra JSON real exportado pelo Construct.
- [ ] Criar fixture DSL minima usando `BulletBehavior` em um objeto existente.

### BoundToLayout (`src/dictionary/behaviors/boundToLayout/`)

- [ ] Criar modulo.
- [ ] Confirmar ID persistido real (`BoundToLayout` ou variacao).
- [ ] Mapear conditions/actions se houver.

### Fade (`src/dictionary/behaviors/fade/`)

- [ ] Criar modulo.
- [ ] Implementar actions:
  - [ ] start-fade
  - [ ] restart-fade
  - [ ] set-fade-in-time
  - [ ] set-wait-time
  - [ ] set-fade-out-time
- [ ] Implementar conditions:
  - [ ] on-fade-out-finished
  - [ ] on-fade-in-finished

### Timer (`src/dictionary/behaviors/timer/`)

- [ ] Criar modulo.
- [ ] Implementar actions:
  - [ ] start-timer
  - [ ] stop-timer
  - [ ] pause-timer
  - [ ] resume-timer
- [ ] Implementar condition:
  - [ ] on-timer
- [ ] Definir tipo de tag de timer.

## Fase 4: expressoes tipadas

Problema atual: muitas expressoes sao strings soltas como `"Mouse.X"` ou `"player.direction"`.

Objetivo: criar camada de expression descriptors sem quebrar o emitter atual.

- [ ] Criar `src/dictionary/expressions/`.
- [ ] Definir tipo `ExpressionValue`.
- [ ] Permitir que params aceitem string crua ou expression descriptor.
- [ ] Criar helpers globais:
  - [ ] `expr("Mouse.X")`
  - [ ] `literalString("left")` gerando `"\"left\""`
  - [ ] `objectExpr(player, "X")`
  - [ ] `instanceVariable(player, "direction")`
- [ ] Substituir exemplos com strings soltas por helpers quando estiver estavel.
- [ ] Atualizar `llm-instructions.md`.

## Fase 5: validacao semantica do IR

- [ ] Criar `src/core/validation/irValidator.ts`.
- [ ] Validar shape de EventNode antes do emitter.
- [ ] Validar que `conditions` contem apenas conditions.
- [ ] Validar que `actions` contem apenas actions.
- [ ] Validar que action de behavior tem `target.behaviorId`.
- [ ] Validar que action de objeto nao tem `behaviorType` indevido.
- [ ] Validar tipos de parametros:
  - [ ] `number` deve ser number.
  - [ ] `boolean` deve ser boolean.
  - [ ] `key` deve ser number apos encoder.
  - [ ] `object` deve referenciar objeto existente.
  - [ ] `enum` deve estar entre valores permitidos.
- [ ] Validar actions desativadas.
- [ ] Validar `functionBlock` sem children/actions ate suportarmos corpo.
- [ ] Exibir diagnosticos com caminho logico:
  - [ ] `playerController > controls > block[2] > actions[1]`

## Fase 6: testes e fixtures

- [ ] Criar estrutura `tests/` ou `fixtures/`.
- [ ] Criar fixture de projeto virgem baseado em `/home/matheusp/Projetos/construct3-vazio`.
- [ ] Criar fixture de projeto populado baseado em `/home/matheusp/Projetos/construct3`.
- [ ] Criar DSL fixture para `playerController`.
- [ ] Criar snapshot JSON esperado para `playerController`.
- [ ] Criar script `npm run compile:test`.
- [ ] Criar script `npm run test:fixtures`.
- [ ] Testar que `objectTypes/` ausente nao quebra.
- [ ] Testar que objeto com case errado falha.
- [ ] Testar que SID duplicado em arquivo logico falha.
- [ ] Testar que `.uistate.json` e `uistate/` sao ignorados.
- [ ] Testar que `project.c3proj` e sincronizado para folhas novas.
- [ ] Testar que folha existente nao duplica entrada no manifesto.

## Fase 7: ergonomia da CLI

CLI atual:

```bash
node dist/index.js -i <input_dsl> -p <project_root> -o <eventSheets/...json>
```

Pendencias:

- [ ] Adicionar binario documentado `c3-compiler`.
- [ ] Adicionar script `npm run compile`.
- [ ] Adicionar `--dry-run`.
- [ ] Adicionar `--check` para validar sem escrever.
- [ ] Adicionar `--backup` documentado no README.
- [ ] Adicionar logs resumidos de SIDs alocados:
  - [ ] primeiro SID novo
  - [ ] ultimo SID novo
  - [ ] quantidade de nodes gerados
- [ ] Adicionar erro especifico se `-o` nao estiver dentro de `eventSheets/`.
- [ ] Adicionar suporte a compilar varios arquivos DSL em lote.
- [ ] Adicionar opcao `--manifest-only` para reparar registro de folhas existentes.

## Fase 8: documentacao para humanos e LLMs

- [x] `README.md`.
- [x] `llm-instructions.md`.
- [ ] Atualizar `README.md` com tabela completa de plugins/behaviors planejados.
- [ ] Atualizar `llm-instructions.md` sempre que novo helper publico entrar.
- [ ] Criar `docs/dictionary-authoring.md` explicando como adicionar plugin/behavior.
- [ ] Criar `docs/construct-json-reverse-engineering.md` com exemplos reais de JSON.
- [ ] Criar `docs/sid-policy.md`.
- [ ] Criar `docs/manifest-sync.md`.

## Criterio de pronto para cada novo plugin ou behavior

Uma task de dicionario so pode ser marcada como concluida quando:

- [ ] Foi criado modulo isolado em `src/dictionary/plugins/` ou `src/dictionary/behaviors/`.
- [ ] IDs persistidos foram confirmados em JSON real.
- [ ] Params foram tipados.
- [ ] API publica foi exportada.
- [ ] `dictionaryRuntimeGlobals` foi atualizado quando necessario.
- [ ] `constructDictionary` foi atualizado quando aplicavel.
- [ ] `npm run typecheck` passou.
- [ ] Existe exemplo minimo de uso em DSL ou fixture.
- [ ] Nao ha referencia hardcoded a objetos concretos do jogo.
