# c3-compiler

> Compilador TypeScript declarativo para gerar Event Sheets nativas, indexadas e seguras do Construct 3.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Node.js](https://img.shields.io/badge/Node.js-ESM-green)
![Construct%203](https://img.shields.io/badge/Construct%203-Event%20Sheets-orange)
![Status](https://img.shields.io/badge/status-MVP%20Core%20funcional-brightgreen)

## Proposta De Valor

`c3-compiler` é um compilador estilo GCC para o ecossistema Construct 3: ele recebe um script declarativo em TypeScript/JavaScript (`.c3dsl.ts`) e emite arquivos JSON nativos do Construct, já sincronizados com o manifesto global `project.c3proj`.

O objetivo não é substituir o Construct 3, mas remover o atrito estrutural do desenvolvimento visual quando a lógica cresce:

- Versionamento real de lógica visual em arquivos de código legíveis.
- DSL declarativa com composição de objetos, behaviors e plugins.
- Tipagem estática contra strings mágicas como teclas, behaviors e ações conhecidas.
- Metaprogramação guiada por IA sem corromper o projeto visual.
- Alocação automática de SIDs únicos, sem IDs duplicados.
- Escrita atômica para proteger assets `.json` contra falhas de IO.
- Registro automático de Event Sheets no `project.c3proj`, evitando arquivos órfãos invisíveis na IDE da Scirra.

Em vez de editar manualmente árvores JSON frágeis, você declara intenção:

```ts
player.execute(EightDirectionBehavior.simulateControl("right"));
```

E o compilador emite a estrutura nativa que o Construct 3 espera.

## Arquitetura Do Pipeline

O `c3-compiler` foi desenhado como um compilador defensivo, com fases explícitas e responsabilidades isoladas.

```txt
.c3dsl.ts
   |
   v
Reader -> Sandbox -> IR Factory -> SID Registry -> JSON Emitter -> Atomic Writer -> project.c3proj sync
```

### 1. Indexação & Parsing

Antes de compilar qualquer DSL, o compilador lê o projeto Construct 3 real no disco.

Responsabilidades:

- Varre recursivamente os arquivos `.json` do projeto.
- Ignora arquivos e pastas de estado visual do editor, como `.uistate.json` e diretórios `uistate/`.
- Indexa todos os SIDs existentes.
- Detecta colisões de SID no projeto-base antes de gerar qualquer saída.
- Lê `objectTypes/` recursivamente para montar o catálogo case-sensitive de objetos reais.
- Aceita projetos virgens sem `objectTypes/`, interpretando o catálogo de objetos como vazio.

Isso significa que a DSL não inventa objetos. Se o script referenciar `Player`, mas o projeto contém `player`, a compilação falha antes da escrita.

### 2. Isolação Por Sandbox

A DSL é executada com o módulo nativo `node:vm`.

O sandbox recebe somente as factories e capacidades permitidas:

- `sheet`
- `group`
- `block`
- `include`
- `comment`
- `functionBlock`
- `object`
- `use`
- `KeyboardPlugin`
- `MousePlugin`
- `SystemPlugin`
- `SpriteObject`
- `EightDirectionBehavior`
- `PlatformBehavior`
- `PinBehavior`

Esses símbolos são injetados por `dictionaryRuntimeGlobals`, exportado pelo dicionário. Assim, novas capabilities podem entrar no vocabulário sem hardcode no CLI.

### 3. Alocação De SIDs

Construct 3 depende de SIDs numéricos únicos. IDs duplicados podem corromper ou confundir a IDE visual.

O compilador usa uma estratégia de Sequencial Alto:

```txt
maxSid = maior SID encontrado no projeto
nextSid = maxSid + 1
```

Cada novo nó de IR recebe um SID automaticamente:

- Groups.
- Blocks.
- Conditions.
- Actions.
- Function blocks.
- Event sheet raiz.

Nenhum script DSL deve declarar SID manualmente.

### 4. Escrita Atômica

Arquivos `.json` não são sobrescritos diretamente.

O writer segue uma política defensiva:

```txt
1. Escreve arquivo temporário.
2. Valida parse JSON do temporário.
3. Faz backup opcional do original.
4. Substitui via rename atômico.
5. Executa fsync de arquivo e diretório quando suportado.
```

Para folhas de evento, o temporário usa extensão `.tmp.json`.

Para o manifesto global, o temporário usa `.tmp.c3proj`.

### 5. Manifesto Sync

Construct 3 não varre Event Sheets órfãs no disco.

Por isso, além de gerar:

```txt
eventSheets/controllers/playerController.json
```

O compilador também sincroniza:

```txt
project.c3proj
```

Ele localiza a árvore `eventSheets`, infere a pasta a partir da flag `-o` e injeta o nome da folha se ela ainda não estiver registrada.

Exemplo:

```bash
-o eventSheets/controllers/playerController.json
```

Registra a folha `playerController` dentro da subpasta `controllers` no manifesto.

## CLI

O compilador segue uma interface explícita, sem caminhos mágicos.

```bash
node dist/index.js -i <input_dsl> -p <path_projeto_c3> -o <output_relativo_json>
```

| Flag | Obrigatória | Descrição |
|---|---:|---|
| `-i`, `--input` | Sim | Caminho do script DSL de entrada (`.c3dsl.ts`). |
| `-p`, `--project` | Sim | Caminho absoluto ou relativo da pasta do projeto Construct 3 salvo no disco. |
| `-o`, `--output` | Sim | Caminho do JSON de saída dentro do projeto Construct. Deve terminar com `.json`. |
| `--backup` | Não | Cria backup do arquivo original antes de substituir. |

Exemplo real:

```bash
node dist/index.js \
  -i src/scripts/playerController.c3dsl.ts \
  -p /home/matheusp/Projetos/construct3 \
  -o eventSheets/controllers/playerController.json
```

Saída esperada:

```txt
c3-compiler: reading Construct project: /home/matheusp/Projetos/construct3
c3-compiler: indexed 8 object(s) and 89 SID(s)
c3-compiler: executing DSL: /home/matheusp/Projetos/c3-compiler/src/scripts/playerController.c3dsl.ts
c3-compiler: writing event sheet: /home/matheusp/Projetos/construct3/eventSheets/controllers/playerController.json
c3-compiler: wrote /home/matheusp/Projetos/construct3/eventSheets/controllers/playerController.json
c3-compiler: syncing manifest: /home/matheusp/Projetos/construct3/project.c3proj
c3-compiler: wrote /home/matheusp/Projetos/construct3/project.c3proj
```

## Instalação e Configuração

Siga os passos abaixo para clonar o repositório, instalar as dependências e preparar o ambiente de compilação:

### 1. Clonar o Repositório

Abra o seu terminal (ex: Kitty) e execute o comando abaixo para trazer o projeto para a sua máquina local:

```bash
git clone https://github.com/Matheus-Pedrosa30/c3-compiler.git
cd c3-compiler
```

### 2. Instalar Dependências

Instale os pacotes necessários gerenciados pelo npm. O compilador utiliza módulos nativos do Node.js, garantindo uma instalação leve e extremamente rápida:

```bash
npm install
```

### 3. Preparar o Projeto do Construct 3

Para que o compilador funcione perfeitamente ("Estilo GCC"), o seu projeto do Construct 3 **DEVE** estar salvo no seu disco local utilizando a opção **"Save as folder" (Salvar como pasta)**.

O compilador não opera diretamente sobre arquivos únicos comprimidos `.c3p`.

## Comandos De Desenvolvimento

| Comando | Função |
|---|---|
| `npm run typecheck` | Executa `tsc --noEmit` em modo estrito. |
| `npm run build` | Compila TypeScript para `dist/`. |

Pré-requisitos:

```txt
Node.js moderno com suporte a ES Modules
npm
Projeto Construct 3 salvo como pasta no disco
```

## DX: Antes Vs Depois

### Depois: DSL Declarativa

```ts
const player = object("player", SpriteObject, [
  use(EightDirectionBehavior),
]);

sheet("playerController", [
  group("animations", {
    children: [
      block({
        conditions: [
          player.check(EightDirectionBehavior.isMoving()),
        ],
        actions: [
          player.execute(SpriteObject.setAnimationSpeed("20")),
        ],
      }),
    ],
  }),
]);
```

Essa DSL expressa a intenção:

- O objeto `player` existe no projeto Construct.
- Ele é um `SpriteObject`.
- Ele usa o behavior `8Direction`.
- Se estiver se movendo, a velocidade da animação vira `20`.

### Antes: JSON Nativo Da Scirra

O equivalente persistido pelo Construct 3 é uma árvore com IDs internos, campos de runtime e SIDs:

```json
{
	"eventType": "group",
	"disabled": false,
	"title": "animations",
	"description": "",
	"isActiveOnStart": true,
	"children": [
		{
			"eventType": "block",
			"conditions": [
				{
					"id": "is-moving",
					"objectClass": "player",
					"sid": 974262863199618,
					"behaviorType": "8Direction"
				}
			],
			"actions": [
				{
					"id": "set-animation-speed",
					"objectClass": "player",
					"sid": 974262863199619,
					"parameters": {
						"speed": "20"
					}
				}
			],
			"sid": 974262863199617
		}
	],
	"sid": 974262863199620
}
```

O ganho de DX é direto:

- O código-fonte fica revisável.
- O JSON gerado permanece compatível com Construct.
- SIDs são gerados automaticamente.
- O manifesto é sincronizado.
- Objetos inexistentes falham antes de qualquer escrita.

## Tipagem Forte Contra O Formato Físico Do Construct

O dicionário não modela apenas nomes bonitos da DSL. Ele codifica o formato persistido real que o Construct 3 grava em disco.

Campos de dropdown e campos aparentemente textuais podem ter representação física diferente no JSON. O compilador deve esconder essa aspereza da DSL, mas também deve falhar cedo quando alguém passa um valor ambíguo.

Exemplos já confirmados contra JSON real salvo pelo Construct:

```ts
SystemPlugin.compareTwoValues("player.isShooting", "equal", "false");
```

É emitido como:

```json
{
	"id": "compare-two-values",
	"objectClass": "System",
	"parameters": {
		"first-value": "player.isShooting",
		"comparison": 0,
		"second-value": "false"
	}
}
```

O parâmetro `comparison` não é salvo como `"equal"`; ele é salvo como código numérico:

| DSL | JSON |
| --- | ---: |
| `equal` | `0` |
| `not-equal` | `1` |
| `less` | `2` |
| `less-or-equal` | `3` |
| `greater` | `4` |
| `greater-or-equal` | `5` |

Outro exemplo:

```ts
SystemPlugin.createObject(arrow, "2", "player.X", "player.Y");
```

É emitido como:

```json
{
	"id": "create-object",
	"objectClass": "System",
	"parameters": {
		"object-to-create": "arrow",
		"layer": "2",
		"x": "player.X",
		"y": "player.Y",
		"create-hierarchy": false,
		"template-name": "\"\""
	}
}
```

O parâmetro `layer` é o índice numérico da layer persistido como string. Passar nomes como `"Player"` ou literais como `"\"Player\""` é rejeitado com erro explícito antes da escrita.

## Recursos Avançados Implementados

### Injeção Dinâmica De Globais Do Dicionário

O sandbox não possui uma lista manual de plugins e behaviors espalhada pelo core.

O dicionário exporta:

```ts
dictionaryRuntimeGlobals
```

Esse objeto é injetado no `node:vm`, disponibilizando o vocabulário da DSL:

```ts
KeyboardPlugin.isKeyDown("D");
MousePlugin.cursorIsOverObject(viewportRegions);
PinBehavior.pinToObjectProperties("player", { x: true, y: true, angle: true, width: "no", height: "no", z: false });
```

### Ações Desativadas

O compilador suporta `disabled: true` em ações, preservando comportamento visual do Construct.

Exemplo DSL:

```ts
function disabled(action) {
  return {
    ...action,
    disabled: true,
  };
}

disabled(player.execute(SpriteObject.setInstanceVariable("direction", "\"right\"")));
```

Saída JSON:

```json
{
	"id": "set-instvar-value",
	"objectClass": "player",
	"sid": 974262863199620,
	"disabled": true,
	"parameters": {
		"instance-variable": "direction",
		"value": "\"right\""
	}
}
```

### Function Blocks

Estruturas especiais do Construct, como funções internas, são representadas na DSL por:

```ts
functionBlock("shootArrow");
```

Saída JSON:

```json
{
	"functionName": "shootArrow",
	"functionDescription": "",
	"functionCategory": "",
	"functionReturnType": "none",
	"functionCopyPicked": false,
	"functionIsAsync": false,
	"functionParameters": [],
	"eventType": "function-block",
	"conditions": [],
	"actions": [],
	"sid": 974262863199621
}
```

## Composição De Objetos

Behaviors não pertencem a objetos no dicionário. Eles são capabilities reutilizáveis.

```ts
const player = object("player", SpriteObject, [
  use(EightDirectionBehavior),
]);

player.execute(EightDirectionBehavior.simulateControl("right"));
```

O binding tardio injeta o target:

```txt
objectClass: "player"
behaviorType: "8Direction"
```

Isso evita duplicação como `player.platform.*` ou `enemy.platform.*` e mantém o core agnóstico.

## Integridade E Segurança

O compilador falha fechado.

Ele aborta quando encontra:

- SID inválido.
- SID duplicado em arquivos reais do projeto.
- Objeto referenciado pela DSL que não existe em `objectTypes/`.
- Diferença de case no nome do objeto.
- DSL sem `sheet(...)`.
- Mais de uma folha no mesmo input.
- Saída fora da pasta do projeto.
- Saída que não termina com `.json`.
- Manifesto sem árvore `eventSheets`.

Nenhum arquivo é escrito se as fases anteriores não passarem.

## Estrutura Do Projeto

```txt
src/
  core/
    construct/
      atomicWrite.ts
      constructJsonEmitter.ts
      constructProjectReader.ts
      constructProjectWriter.ts
    ir/
      irFactory.ts
      irTypes.ts
    runtime/
      dslRuntime.ts
      dslSandbox.ts
    sid/
      sidAllocator.ts
      sidRegistry.ts
      sidScanner.ts

  dictionary/
    behaviors/
      eightDirection/
      pin/
      platform/
    bindings/
    objects/
    params/
    plugins/

  scripts/
    playerController.c3dsl.ts
```

## Filosofia

`c3-compiler` trata o Construct 3 como uma engine visual com um formato de persistência real, não como uma caixa-preta.

A regra central do projeto é:

```txt
O usuário cria objetos no Construct.
A DSL referencia esses objetos.
O compilador valida, gera, indexa e escreve com segurança.
```

Isso cria um caminho híbrido:

- Design visual onde o Construct é forte.
- Código versionável onde lógica repetitiva se torna difícil de manter manualmente.
- IA como copiloto de geração declarativa, sem tocar diretamente no JSON frágil.

O resultado é uma ponte entre tooling moderno de compiladores e o ecossistema visual da Scirra.
