import { DefaultEntity } from "./Entities";
import { PositionComponent, DimensionsComponent, ColliderComponent, SpriteComponent } from "./EntityComponents";

export class Map extends Array<DefaultEntity> {
	constructor() {
		super(
			new DefaultEntity("Brown brick", [
				new PositionComponent({ x: 0, y: 300 }),
				new DimensionsComponent({ width: 600, height: 300 }),
				new ColliderComponent("static"),
				new SpriteComponent("brownBrick"),
			]),
			new DefaultEntity("UvTestTexture", [
				new PositionComponent({ x: 75, y: 530 }),
				new DimensionsComponent({ width: 50, height: 25 }),
				new ColliderComponent("rigid"),
				new SpriteComponent("uvTestTexture"),
			]),
			new DefaultEntity("RedTexture", [
				new PositionComponent({ x: 0, y: 0 }),
				new DimensionsComponent({ width: 600, height: 300 }),
				new ColliderComponent("rigid"),
				new SpriteComponent("redTexture"),
			]),
		);
	}
}
