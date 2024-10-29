import { Component } from "../../../types/ECS";

export class GravityComponent implements Component {
	readonly type = "gravity";
	constructor(public mass: number) {}
}
