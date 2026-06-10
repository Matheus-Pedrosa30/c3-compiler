# Instruções Para LLMs: Uso Correto Do `c3-compiler`

Este documento é para agentes de codificação. Siga estas regras literalmente.

## 1. Objetivo Do Sistema

`c3-compiler` é um transpiler estrito para Construct 3.

Seu papel como LLM é gerar arquivos de alto nível `.c3dsl.ts` usando TypeScript/JavaScript declarativo. O compilador executa essa DSL em sandbox e traduz a árvore declarada para JSON nativo de persistência do Construct 3.

Você NÃO deve gerar JSON final do Construct manualmente.

Você NÃO deve editar `project.c3proj` manualmente.

Você NÃO deve inventar SIDs.

Você DEVE escrever lógica visual como declarações de Event Sheets:

```ts
sheet("playerController", [
	group("controls", {
		children: [
			block({
				conditions: [
					KeyboardPlugin.isKeyDown("D"),
				],
				actions: [
					player.execute(EightDirectionBehavior.simulateControl("right")),
				],
			}),
		],
	}),
]);
```

O core do compilador fará:

- Leitura do projeto Construct 3.
- Validação de objetos reais em `objectTypes/`.
- Alocação de SIDs.
- Emissão de JSON.
- Escrita atômica.
- Sincronização do manifesto `project.c3proj`.

## 2. Regras Críticas De Entidades E Validação

### CASE-SENSITIVITY É MANDATÓRIO

Você DEVE escrever nomes de objetos exatamente como estão no projeto Construct 3.

Se o arquivo no projeto é:

```txt
objectTypes/player/player.json
```

Então use:

```ts
const player = object("player", SpriteObject, [
	use(EightDirectionBehavior),
]);
```

É PROIBIDO usar:

```ts
const player = object("Player", SpriteObject);
```

`Player` e `player` são objetos diferentes. Se o nome não existir exatamente em `objectTypes/`, o pipeline deve falhar.

### NÃO INVENTE OBJETOS

A DSL não cria objetos no Construct 3.

Ela apenas referencia objetos que já existem no projeto visual.

Você DEVE assumir que objetos como `player`, `camera`, `mira`, `viewportRegions`, `Keyboard` e `Mouse` só são válidos se existirem no projeto base.

### NÃO INVENTE SIDs

É PROIBIDO escrever:

```ts
sid: 123456789012345
```

O `SidAllocator` gera SIDs automaticamente.

Você deve focar apenas na lógica conceitual.

### NÃO GERE METADADOS DE UI

É PROIBIDO gerar ou manipular:

```txt
*.uistate.json
layouts/uistate/
scroll
zoom
expanded/collapsed state
editor tabs
```

Esses dados são estado visual do editor. Não fazem parte da lógica.

## 3. Guia De Sintaxe Da DSL

### Objetos E Behaviors

Você DEVE declarar objetos com a factory `object(name, type, behaviors)`.

Padrão:

```ts
const player = object("player", SpriteObject, [
	use(EightDirectionBehavior),
]);
```

Objeto sem behavior:

```ts
const mira = object("mira", SpriteObject);
```

Objeto com behavior `Pin`:

```ts
const camera = object("camera", SpriteObject, [
	use(PinBehavior),
]);
```

### Composição Tardia

O padrão correto é composição tardia.

Para condições de behavior:

```ts
player.check(EightDirectionBehavior.isMoving());
```

Para ações de behavior:

```ts
player.execute(EightDirectionBehavior.simulateControl("left"));
```

Para ações de objeto:

```ts
player.execute(SpriteObject.setAnimationSpeed("20"));
```

### NÃO Use Chaining Rígido

É PROIBIDO usar:

```ts
player.platform.simulateControl("left");
player.eightDirection.isMoving();
player.sprite.setAnimationSpeed("20");
```

O objeto não possui APIs aninhadas. O behavior é uma capability separada e reutilizável.

### Tipagem Forte Do JSON Persistido

Você DEVE respeitar os formatos físicos confirmados em JSON real salvo pelo Construct.

O compilador aceita DSL humana, mas o dicionário converte para códigos e formatos internos do Construct. Não invente o formato persistido.

#### SystemPlugin.compareTwoValues

Use labels humanos na DSL:

```ts
SystemPlugin.compareTwoValues("player.isShooting", "equal", "false");
SystemPlugin.compareTwoValues("Mouse.X", "greater-or-equal", "player.X");
```

Você DEVE usar somente estes labels:

```txt
equal
not-equal
less
less-or-equal
greater
greater-or-equal
```

O JSON persistido usa códigos numéricos:

```txt
equal            -> 0
not-equal        -> 1
less             -> 2
less-or-equal    -> 3
greater          -> 4
greater-or-equal -> 5
```

É PROIBIDO passar números diretamente na DSL. O dicionário faz a conversão.

#### SystemPlugin.createObject

Use índice numérico de layer, não nome de layer:

```ts
SystemPlugin.createObject(arrow, "2", "player.X", "player.Y");
```

O Construct persiste `layer` como string numérica:

```json
"layer": "2"
```

É PROIBIDO usar:

```ts
SystemPlugin.createObject(arrow, "Player", "player.X", "player.Y");
SystemPlugin.createObject(arrow, "\"Player\"", "player.X", "player.Y");
```

Se você não souber o índice da layer, peça o JSON do layout ou peça para o usuário confirmar antes de gerar a DSL.

#### BulletBehavior

Números digitáveis do behavior Bullet são persistidos pelo Construct como strings de expressão.

Use:

```ts
arrow.execute(BulletBehavior.setSpeed(400));
arrow.execute(BulletBehavior.setAngleOfMotion(45));
arrow.execute(BulletBehavior.setAngleOfMotion("angle(player.X, player.Y, Mouse.X, Mouse.Y)"));
```

O JSON esperado é:

```json
"speed": "400"
"angle": "45"
"angle": "angle(player.X, player.Y, Mouse.X, Mouse.Y)"
```

É PROIBIDO escrever JSON manual com `"speed": 400` ou `"angle": 45`.

### Factories Globais De Estrutura

Use somente estas factories para montar a árvore da Event Sheet:

```ts
sheet(name, children);
group(title, { children });
block({ conditions, actions });
comment(text);
include(sheetName);
functionBlock(functionName);
```

Exemplo:

```ts
sheet("mainController", [
	comment("Entrada principal"),
	include("playerController"),
]);
```

### Forma Obrigatória De Bloco

Você DEVE colocar conditions e actions dentro de arrays:

```ts
block({
	conditions: [
		SystemPlugin.everyTick(),
	],
	actions: [
		player.execute(SpriteObject.setAnimation("player.direction", "beginning")),
	],
});
```

É PROIBIDO escrever ações soltas fora de `actions`.

É PROIBIDO escrever condições soltas fora de `conditions`.

## 4. Exemplos Canônicos De Geração

### SystemPlugin.else()

Use `SystemPlugin.else()` para o bloco `else` do Construct.

```ts
block({
	conditions: [
		SystemPlugin.else(),
	],
	actions: [
		player.execute(SpriteObject.setAnimationSpeed("0")),
		player.execute(SpriteObject.setAnimationFrame("0")),
	],
});
```

### SystemPlugin.everyTick()

Use `SystemPlugin.everyTick()` para lógica que roda a cada tick.

```ts
block({
	conditions: [
		SystemPlugin.everyTick(),
	],
	actions: [
		player.execute(SpriteObject.setAnimation("player.direction", "beginning")),
	],
});
```

### KeyboardPlugin E KeyCodes

Você DEVE usar nomes humanos de teclas. O dicionário converte para KeyCodes.

```ts
block({
	conditions: [
		KeyboardPlugin.isKeyDown("W"),
	],
	actions: [
		player.execute(EightDirectionBehavior.simulateControl("up")),
	],
});
```

Mapeamentos importantes:

```txt
"W" -> 87
"S" -> 83
"D" -> 68
"A" -> 65
"Space" -> 32
"ArrowRight" -> 39
```

É PROIBIDO passar `87` diretamente quando existir nome humano.

### Variáveis De Instância

Use actions de `SpriteObject` para alterar variáveis de instância.

Padrão atual implementado:

```ts
player.execute(SpriteObject.setInstanceVariable("direction", "\"left\""));
```

O valor `"\"left\""` representa uma string literal do Construct.

Para expressões, não use aspas extras:

```ts
player.execute(SpriteObject.setInstanceVariable("direction", "viewportRegions.direcao"));
```

Se você encontrar documentação antiga usando `setInstVar`, normalize para:

```ts
SpriteObject.setInstanceVariable(...)
```

### Ações Desativadas

Para preservar `disabled: true` em ações, use um helper local:

```ts
function disabled(action) {
	return {
		...action,
		disabled: true,
	};
}
```

Uso:

```ts
disabled(player.execute(SpriteObject.setInstanceVariable("direction", "\"right\"")));
```

### MousePlugin

Condição de cursor sobre objeto:

```ts
const viewportRegions = object("viewportRegions", SpriteObject);

block({
	conditions: [
		MousePlugin.cursorIsOverObject(viewportRegions),
	],
	actions: [
		player.execute(SpriteObject.setInstanceVariable("direction", "viewportRegions.direcao")),
	],
});
```

Alterar cursor:

```ts
MousePlugin.setCursorStyle("none");
```

### PinBehavior

Declare o objeto com `PinBehavior`:

```ts
const camera = object("camera", SpriteObject, [
	use(PinBehavior),
]);
```

Use a action por composição:

```ts
camera.execute(PinBehavior.pinToObjectProperties("player", {
	x: true,
	y: true,
	angle: true,
	width: "no",
	height: "no",
	z: false,
}));
```

### Function Blocks

Use `functionBlock` para declarar uma função interna do Construct:

```ts
group("actions", {
	children: [
		group("shoot", {
			children: [
				functionBlock("shootArrow"),
			],
		}),
	],
});
```

Não tente montar manualmente a estrutura JSON de function-block.

## 5. Anti-Patterns: Erros Comuns De Alucinação

### NÃO Use Chaining De Objeto

Errado:

```ts
player.platform.simulateControl("left");
player.keyboard.isKeyDown("A");
player.animation.setSpeed("20");
```

Correto:

```ts
player.execute(EightDirectionBehavior.simulateControl("left"));
KeyboardPlugin.isKeyDown("A");
player.execute(SpriteObject.setAnimationSpeed("20"));
```

### NÃO Escreva JavaScript Imperativo De Gameplay

É PROIBIDO:

```ts
if (KeyboardPlugin.isKeyDown("A")) {
	player.execute(EightDirectionBehavior.simulateControl("left"));
}
```

A DSL é declarativa. Use `block`.

Correto:

```ts
block({
	conditions: [
		KeyboardPlugin.isKeyDown("A"),
	],
	actions: [
		player.execute(EightDirectionBehavior.simulateControl("left")),
	],
});
```

### NÃO Crie Actions Fora De Blocks

Errado:

```ts
player.execute(SpriteObject.setAnimationSpeed("20"));
```

Correto:

```ts
block({
	conditions: [
		player.check(EightDirectionBehavior.isMoving()),
	],
	actions: [
		player.execute(SpriteObject.setAnimationSpeed("20")),
	],
});
```

### NÃO Escreva JSON Do Construct Manualmente

Errado:

```ts
{
	eventType: "block",
	conditions: [
		{
			id: "key-is-down",
			objectClass: "Keyboard",
			sid: 123
		}
	]
}
```

Correto:

```ts
block({
	conditions: [
		KeyboardPlugin.isKeyDown("D"),
	],
	actions: [
		player.execute(EightDirectionBehavior.simulateControl("right")),
	],
});
```

### NÃO Declare Objetos Que Não Existem

Errado:

```ts
const enemy = object("enemy", SpriteObject);
```

Se `objectTypes/enemy/enemy.json` ou equivalente não existir no projeto Construct, isso falhará.

Correto: só declare objetos que o usuário criou manualmente no Construct.

### NÃO Use Nome De Pasta Como Nome De Objeto

Se existir:

```txt
objectTypes/player/player.json
```

O objeto é:

```txt
player
```

Não assuma que a pasta sempre é o objeto. Leia ou respeite o campo `"name"` do JSON.

### NÃO Gere Includes Para Arquivos Inexistentes

Errado:

```ts
include("fooController");
```

Só inclua uma Event Sheet que exista ou que será gerada e registrada no mesmo projeto.

## 6. Template Recomendado Para Nova Event Sheet

Use este esqueleto:

```ts
// @ts-nocheck

const player = object("player", SpriteObject, [
	use(EightDirectionBehavior),
]);

function disabled(action) {
	return {
		...action,
		disabled: true,
	};
}

sheet("playerController", [
	group("controls", {
		children: [
			block({
				conditions: [
					KeyboardPlugin.isKeyDown("D"),
				],
				actions: [
					player.execute(EightDirectionBehavior.simulateControl("right")),
					disabled(player.execute(SpriteObject.setInstanceVariable("direction", "\"right\""))),
				],
			}),
		],
	}),
]);
```

## 7. Checklist Antes De Finalizar Um `.c3dsl.ts`

Antes de entregar código DSL, verifique:

- Todos os objetos foram declarados com `object(...)`.
- Todos os nomes de objetos estão case-sensitive.
- Todos os behaviors usados em `.execute` ou `.check` foram declarados com `use(...)`.
- Todas as conditions estão dentro de `conditions: []`.
- Todas as actions estão dentro de `actions: []`.
- Nenhum SID foi escrito manualmente.
- Nenhum JSON nativo do Construct foi escrito manualmente.
- Nenhum `if`, `for`, `while` ou lógica imperativa de gameplay foi usado para simular eventos.
- O arquivo contém uma chamada `sheet(...)`.
- A saída esperada será registrada via CLI com `-o eventSheets/.../Nome.json`.

## 8. Comando De Compilação Esperado

Após gerar o DSL, o usuário ou agente executor deve chamar:

```bash
node dist/index.js \
	-i src/scripts/playerController.c3dsl.ts \
	-p /caminho/para/projeto-construct \
	-o eventSheets/controllers/playerController.json
```

Não use caminhos padrão.

Não omita flags.

Não escreva fora de `eventSheets/`.

O compilador deve cuidar da escrita da folha e da sincronização de `project.c3proj`.
