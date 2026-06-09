// @ts-nocheck

const player = object("player", SpriteObject, [
	use(EightDirectionBehavior),
]);
const mira = object("mira", SpriteObject);
const camera = object("camera", SpriteObject, [
	use(PinBehavior),
]);
const viewportRegions = object("viewportRegions", SpriteObject);

function disabled(action) {
	return {
		...action,
		disabled: true,
	};
}

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
			block({
				conditions: [
					SystemPlugin.else(),
				],
				actions: [
					player.execute(SpriteObject.setAnimationSpeed("0")),
					player.execute(SpriteObject.setAnimationFrame("0")),
				],
			}),
			block({
				conditions: [
					MousePlugin.cursorIsOverObject(viewportRegions),
				],
				actions: [
					player.execute(SpriteObject.setInstanceVariable("direction", "viewportRegions.direcao")),
				],
			}),
			block({
				conditions: [
					SystemPlugin.everyTick(),
				],
				actions: [
					player.execute(SpriteObject.setAnimation("player.direction", "beginning")),
				],
			}),
		],
	}),

	group("controls", {
		children: [
			block({
				conditions: [
					KeyboardPlugin.isKeyDown("W"),
				],
				actions: [
					player.execute(EightDirectionBehavior.simulateControl("up")),
					disabled(player.execute(SpriteObject.setInstanceVariable("direction", "\"up\""))),
				],
			}),
			block({
				conditions: [
					KeyboardPlugin.isKeyDown("S"),
				],
				actions: [
					player.execute(EightDirectionBehavior.simulateControl("down")),
					disabled(player.execute(SpriteObject.setInstanceVariable("direction", "\"down\""))),
				],
			}),
			block({
				conditions: [
					KeyboardPlugin.isKeyDown("D"),
				],
				actions: [
					player.execute(EightDirectionBehavior.simulateControl("right")),
					disabled(player.execute(SpriteObject.setInstanceVariable("direction", "\"right\""))),
				],
			}),
			block({
				conditions: [
					KeyboardPlugin.isKeyDown("A"),
				],
				actions: [
					player.execute(EightDirectionBehavior.simulateControl("left")),
					disabled(player.execute(SpriteObject.setInstanceVariable("direction", "\"left\""))),
				],
			}),
		],
	}),

	group("camera", {
		children: [
			block({
				conditions: [
					SystemPlugin.everyTick(),
				],
				actions: [
					mira.execute(SpriteObject.setPosition("Mouse.X", "Mouse.Y")),
				],
			}),
			block({
				conditions: [
					SystemPlugin.onStartOfLayout(),
				],
				actions: [
					MousePlugin.setCursorStyle("none"),
					camera.execute(PinBehavior.pinToObjectProperties("player", {
						x: true,
						y: true,
						angle: true,
						width: "no",
						height: "no",
						z: false,
					})),
				],
			}),
		],
	}),

	group("actions", {
		children: [
			group("shoot", {
				children: [
					functionBlock("shootArrow"),
				],
			}),
		],
	}),
]);
