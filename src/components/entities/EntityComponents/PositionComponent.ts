import { Component } from "../../../types/ECS";
import { Vector2 } from "../../../types/Vector2";

export class PositionComponent implements Component {
	readonly type = "position";

	constructor(
		public position: Vector2,
		public previousPosition: Vector2 = { x: position.x.valueOf(), y: position.y.valueOf() },
	) {}
}
