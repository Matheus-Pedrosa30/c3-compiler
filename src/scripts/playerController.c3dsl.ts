// @ts-nocheck

const player = object("player", SpriteObject, [
	use(EightDirectionBehavior),
]);
const arrow = object("arrow", SpriteObject, [
	use(BulletBehavior),
]);
const mira = object("mira", SpriteObject);
const camera = object("camera", SpriteObject, [
	use(PinBehavior),
]);
const viewportRegions = object("viewportRegions", SpriteObject);

const ARROW_LAYER = "2";
const ARROW_SPEED = 400;
const ARROW_ANGLE = "angle(player.X, player.Y, Mouse.X, Mouse.Y)";
const AIM_DELTA_X = "abs(Mouse.X - player.X)";
const AIM_DELTA_Y = "abs(Mouse.Y - player.Y)";
const NOT_SHOOTING = {
	...player.check(SpriteObject.isBooleanInstanceVariableSet("isShooting")),
	isInverted: true,
};
const NOT_MOVING = {
	...player.check(EightDirectionBehavior.isMoving()),
	isInverted: true,
};

function disabled(action) {
	return {
		...action,
		disabled: true,
	};
}

function shootArrowActions(direction) {
	return [
		player.execute(SpriteObject.setBooleanInstanceVariable("isShooting", true)),
		player.execute(SpriteObject.setAnimationSpeed("20")),
		player.execute(SpriteObject.setAnimation(`"${direction}Arrow"`, "beginning")),
		SystemPlugin.createObject(arrow, ARROW_LAYER, "player.X", "player.Y"),
		arrow.execute(BulletBehavior.setSpeed(ARROW_SPEED)),
		arrow.execute(BulletBehavior.setAngleOfMotion(ARROW_ANGLE)),
	];
}

function finishShootActions(direction) {
	return [
		player.execute(SpriteObject.setInstanceVariable("direction", `"${direction}"`)),
		player.execute(SpriteObject.setBooleanInstanceVariable("isShooting", false)),
	];
}

sheet("playerController", [
	group("animations", {
		children: [
			block({
				conditions: [
					NOT_SHOOTING,
					player.check(EightDirectionBehavior.isMoving()),
				],
				actions: [
					player.execute(SpriteObject.setAnimationSpeed("20")),
				],
			}),
			block({
				conditions: [
					NOT_SHOOTING,
					NOT_MOVING,
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
					NOT_SHOOTING,
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
					block("shoot right arrow", {
						conditions: [
							KeyboardPlugin.onKeyPressed("Q"),
							NOT_SHOOTING,
							SystemPlugin.compareTwoValues(AIM_DELTA_X, "greater-or-equal", AIM_DELTA_Y),
							SystemPlugin.compareTwoValues("Mouse.X", "greater-or-equal", "player.X"),
						],
						actions: shootArrowActions("right"),
					}),
					block("shoot left arrow", {
						conditions: [
							KeyboardPlugin.onKeyPressed("Q"),
							NOT_SHOOTING,
							SystemPlugin.compareTwoValues(AIM_DELTA_X, "greater-or-equal", AIM_DELTA_Y),
							SystemPlugin.compareTwoValues("Mouse.X", "less", "player.X"),
						],
						actions: shootArrowActions("left"),
					}),
					block("shoot up arrow", {
						conditions: [
							KeyboardPlugin.onKeyPressed("Q"),
							NOT_SHOOTING,
							SystemPlugin.compareTwoValues(AIM_DELTA_Y, "greater", AIM_DELTA_X),
							SystemPlugin.compareTwoValues("Mouse.Y", "less", "player.Y"),
						],
						actions: shootArrowActions("up"),
					}),
					block("shoot down arrow", {
						conditions: [
							KeyboardPlugin.onKeyPressed("Q"),
							NOT_SHOOTING,
							SystemPlugin.compareTwoValues(AIM_DELTA_Y, "greater", AIM_DELTA_X),
							SystemPlugin.compareTwoValues("Mouse.Y", "greater-or-equal", "player.Y"),
						],
						actions: shootArrowActions("down"),
					}),
					block("finish right arrow", {
						conditions: [
							player.check(SpriteObject.onAnimationFinished("\"rightArrow\"")),
						],
						actions: finishShootActions("right"),
					}),
					block("finish left arrow", {
						conditions: [
							player.check(SpriteObject.onAnimationFinished("\"leftArrow\"")),
						],
						actions: finishShootActions("left"),
					}),
					block("finish up arrow", {
						conditions: [
							player.check(SpriteObject.onAnimationFinished("\"upArrow\"")),
						],
						actions: finishShootActions("up"),
					}),
					block("finish down arrow", {
						conditions: [
							player.check(SpriteObject.onAnimationFinished("\"downArrow\"")),
						],
						actions: finishShootActions("down"),
					}),
				],
			}),
		],
	}),
]);
