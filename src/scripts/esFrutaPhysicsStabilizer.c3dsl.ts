// @ts-nocheck

const fruta = object("fruta", SpriteObject, [
	use(PhysicsBehavior),
]);

const tubo = object("tubo", SpriteObject, [
	use(PhysicsBehavior),
]);

const tubo2 = object("tubo2", SpriteObject);
const text = object("Text", { id: "Text" });

function param(name, valueType, value) {
	return { name, valueType, value };
}

function systemCondition(constructId, params = []) {
	return {
		kind: "condition",
		dictionaryId: "System",
		constructId,
		params,
	};
}

function systemAction(constructId, params = []) {
	return {
		kind: "action",
		dictionaryId: "System",
		constructId,
		params,
	};
}

function objectCondition(objectName, constructId, params = []) {
	return {
		kind: "condition",
		dictionaryId: "Object",
		constructId,
		target: { objectName },
		params,
	};
}

function objectAction(objectName, constructId, params = []) {
	return {
		kind: "action",
		dictionaryId: "Object",
		constructId,
		target: { objectName },
		params,
	};
}

function behaviorCondition(objectName, behaviorId, constructId, params = []) {
	return {
		kind: "condition",
		dictionaryId: behaviorId,
		constructId,
		target: { objectName, behaviorId },
		params,
	};
}

sheet("esFrutaPhysicsStabilizer", [
	comment("Estabilizacao fisica das frutas apos colisao e repouso no tubo."),

	group("fruit physics stabilizer", {
		children: [
			block("unfreeze fruit while dragging", {
				conditions: [
					behaviorCondition(fruta.name, "DragDrop", "on-drag-start"),
				],
				actions: [
					fruta.execute(PhysicsBehavior.setImmovable(false)),
					fruta.execute(PhysicsBehavior.setVelocity(0, 0)),
					fruta.execute(PhysicsBehavior.setAngularVelocity(0)),
				],
			}),

			block("soften fruit impact inside tube", {
				conditions: [
					fruta.check(PhysicsBehavior.onCollisionWithAnotherObject(tubo.name)),
				],
				actions: [
					fruta.execute(PhysicsBehavior.setFriction(1)),
					fruta.execute(PhysicsBehavior.setElasticity(0)),
					fruta.execute(PhysicsBehavior.setAngularDamping(0.95)),
				],
			}),

			block("lock immediately overlapped fruits", {
				conditions: [
					fruta.check(PhysicsBehavior.onCollisionWithAnotherObject(fruta.name)),
				],
				actions: [
					fruta.execute(PhysicsBehavior.setVelocity(0, 0)),
					fruta.execute(PhysicsBehavior.setAngularVelocity(0)),
					fruta.execute(PhysicsBehavior.setImmovable(true)),
				],
			}),

			block("freeze settled fruit", {
				conditions: [
					fruta.check(PhysicsBehavior.isSleeping()),
				],
				actions: [
					fruta.execute(PhysicsBehavior.setVelocity(0, 0)),
					fruta.execute(PhysicsBehavior.setAngularVelocity(0)),
					fruta.execute(PhysicsBehavior.setImmovable(true)),
				],
			}),
		],
	}),

	functionBlock("ContarBolinhasCorrigido", {
		actions: [
			systemAction("set-eventvar-value", [
				param("variable", "string", "nbolinas"),
				param("value", "expression", "0"),
			]),
		],
		children: [
			block("count picked fruits inside tubo2", {
				conditions: [
					systemCondition("for-each", [
						param("object", "object", fruta.name),
					]),
				],
				actions: [],
				children: [
					block("fruit overlaps count region", {
						conditions: [
							objectCondition(fruta.name, "is-overlapping-another-object", [
								param("object", "object", tubo2.name),
							]),
						],
						actions: [
							systemAction("add-to-eventvar", [
								param("variable", "string", "nbolinas"),
								param("value", "expression", "1"),
							]),
						],
					}),
				],
			}),

			block("publish corrected count", {
				conditions: [],
				actions: [
					objectAction(text.name, "set-text", [
						param("text", "expression", "nbolinas"),
					]),
				],
			}),
		],
	}),
]);
