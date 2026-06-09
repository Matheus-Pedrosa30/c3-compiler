const player = object("player", SpriteObject, [
	use(EightDirectionBehavior),
]);

sheet("playerControllerGenerated", [
	group("controls", {
		children: [
			block("move right", {
				conditions: [
					KeyboardPlugin.isKeyDown("D"),
				],
				actions: [
					player.execute(EightDirectionBehavior.simulateControl("right")),
					player.execute(SpriteObject.setMirrored(false)),
				],
			}),
			block("idle", {
				conditions: [
					SystemPlugin.else(),
				],
				actions: [
					player.execute(SpriteObject.setAnimationSpeed("0")),
				],
			}),
		],
	}),
]);
