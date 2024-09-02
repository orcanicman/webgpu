import { Component, Entity } from "../../types/ECS";

export class DefaultEntity implements Entity {
	constructor(
		public id: string,
		public components: Component[],
	) {}
}
