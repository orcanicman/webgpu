import { Dimensions2D } from "../../types/Dimensions2D";
import { Component } from "../../types/ECS";
import { Vector2 } from "../../types/Vector2";

export class ColliderComponent implements Component {
	readonly type = "collider";
	public isColliding = false;

	constructor(public colliderType: "rigid" | "static" | "dynamic") {}
}

export class ControllableComponent implements Component {
	readonly type = "controllable";
	constructor(public speed: number) {}
}

export class DimensionsComponent implements Component {
	readonly type = "dimensions";
	constructor(public dimensions: Dimensions2D) {}
}

export class GravityComponent implements Component {
	readonly type = "gravity";
	constructor(public mass: number) {}
}

export class PositionComponent implements Component {
	readonly type = "position";

	constructor(
		public position: Vector2,
		public previousPosition: Vector2 = { x: position.x.valueOf(), y: position.y.valueOf() },
	) {}
}

export class SpriteComponent implements Component {
	readonly type = "sprite";
	constructor(public source: ImageBitmap) {}
}

export class VelocityComponent implements Component {
	readonly type = "velocity";
	constructor(
		public velocity: Vector2,
		public maxVelocity: Vector2 = { x: Infinity, y: Infinity },
	) {}
}
