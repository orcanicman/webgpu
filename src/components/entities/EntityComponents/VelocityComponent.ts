import { Component } from "../../../types/ECS";
import { Vector2 } from "../../../types/Vector2";

export class VelocityComponent implements Component {
	readonly type = "velocity";
	constructor(
		public velocity: Vector2,
		public maxVelocity: Vector2 = { x: Infinity, y: Infinity },
		public originalMaxVelocity: Vector2 = { x: maxVelocity.x.valueOf(), y: maxVelocity.y.valueOf() },
	) {}
}
