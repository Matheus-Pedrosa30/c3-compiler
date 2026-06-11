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
const SHOOT_ANIMATION = 'player.direction & "Arrow"';
const SWORD_ANIMATION = 'player.direction & "Sword"';
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

function shootArrowActions() {
	return [
		player.execute(SpriteObject.setBooleanInstanceVariable("isShooting", true)),
		player.execute(SpriteObject.setAnimationSpeed("20")),
		player.execute(SpriteObject.setAnimation(SHOOT_ANIMATION, "beginning")),
		SystemPlugin.createObject(arrow, ARROW_LAYER, "player.X", "player.Y"),
		arrow.execute(BulletBehavior.setSpeed(ARROW_SPEED)),
		arrow.execute(BulletBehavior.setAngleOfMotion(ARROW_ANGLE)),
	];
}

function finishShootActions() {
	return [
		player.execute(SpriteObject.setBooleanInstanceVariable("isShooting", false)),
	];
}

function swordActions() {
	return [
		player.execute(SpriteObject.setBooleanInstanceVariable("isShooting", true)),
		player.execute(SpriteObject.setAnimationSpeed("20")),
		player.execute(SpriteObject.setAnimation(SWORD_ANIMATION, "beginning")),
	];
}

function finishSwordActions() {
	return [
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
					NOT_SHOOTING,
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
			group("sword", {
				children: [
					block("slash sword", {
						conditions: [
							MousePlugin.onClick("left"),
							NOT_SHOOTING,
						],
						actions: swordActions(),
					}),
					block("finish sword", {
						conditions: [
							player.check(SpriteObject.onAnimationFinished(SWORD_ANIMATION)),
						],
						actions: finishSwordActions(),
					}),
				],
			}),
			group("shoot", {
				children: [
					block("shoot arrow", {
						conditions: [
							KeyboardPlugin.onKeyPressed("Q"),
							NOT_SHOOTING,
						],
						actions: shootArrowActions(),
					}),
					block("shoot arrow mouse", {
						conditions: [
							MousePlugin.onClick("right"),
							NOT_SHOOTING,
						],
						actions: shootArrowActions(),
					}),
					block("finish arrow", {
						conditions: [
							player.check(SpriteObject.onAnimationFinished(SHOOT_ANIMATION)),
						],
						actions: finishShootActions(),
					}),
				],
			}),
		],
	}),
]);
