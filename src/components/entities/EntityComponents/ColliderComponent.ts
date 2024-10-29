import { Component } from "../../../types/ECS";

export class ColliderComponent implements Component {
	readonly type = "collider";
	public isColliding = false;

	constructor(public colliderType: "rigid" | "static" | "dynamic") {}
}
