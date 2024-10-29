import { Component } from "../../../types/ECS";

export class ControllableComponent implements Component {
	readonly type = "controllable";
	constructor(
		public speed: number,
		public isGrounded: boolean = false,
		public canJump: boolean = true,
	) {}
}
