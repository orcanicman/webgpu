import { Entity } from "../../types/ECS";
import { DefaultEntity } from "./Entities";
import {
	PositionComponent,
	DimensionsComponent,
	ColliderComponent,
	SpriteComponent,
	EffectComponent,
} from "./EntityComponents";

export class Map extends Array<Entity> {
	constructor(public items: Entity[] = []) {
		super(
			// new DefaultEntity("Brown brick", [
			// 	new PositionComponent({ x: 0, y: 300 }),
			// 	new DimensionsComponent({ width: 600, height: 300 }),
			// 	new ColliderComponent("static"),
			// 	new SpriteComponent("brownBrick"),
			// ]),
			new DefaultEntity("Arrow right 1", [
				new PositionComponent({ x: 0, y: 125 }),
				new DimensionsComponent({ width: 250, height: 250 }),
				new ColliderComponent("static"),
				new SpriteComponent("blueArrow"),
			]),
			new DefaultEntity("Arrow right 2", [
				new PositionComponent({ x: 500, y: 125 }),
				new DimensionsComponent({ width: 250, height: 250 }),
				new ColliderComponent("static"),
				new EffectComponent(["speed"]),
				new SpriteComponent("blueArrow"),
			]),
			new DefaultEntity("Arrow right 3", [
				new PositionComponent({ x: 1000, y: 125 }),
				new DimensionsComponent({ width: 250, height: 250 }),
				new ColliderComponent("static"),
				new SpriteComponent("blueArrow"),
			]),
			new DefaultEntity("Blue wall Top left", [
				new PositionComponent({ x: 0, y: 500 }),
				new DimensionsComponent({ width: 1250, height: 800 }),
				new ColliderComponent("rigid"),
				new SpriteComponent("blueTexture"),
			]),
			new DefaultEntity("Blue wall Bottom left", [
				new PositionComponent({ x: 0, y: -1500 }),
				new DimensionsComponent({ width: 1500, height: 1500 }),
				new ColliderComponent("rigid"),
				new SpriteComponent("blueTexture"),
			]),
			new DefaultEntity("Blue wall right", [
				new PositionComponent({ x: 1750, y: -1000 }),
				new DimensionsComponent({ width: 500, height: 1000 }),
				new ColliderComponent("rigid"),
				new SpriteComponent("blueTexture"),
			]),
			new DefaultEntity("Blue wall bottom right", [
				new PositionComponent({ x: 1500, y: -1500 }),
				new DimensionsComponent({ width: 1000, height: 250 }),
				new ColliderComponent("rigid"),
				new SpriteComponent("blueTexture"),
			]),
			...portalStuff,
			...items,
		);
	}
}

const portalStuff: Entity[] = [
	new DefaultEntity("Portal bottom", [
		new PositionComponent({ x: 2250, y: -1250 }),
		new DimensionsComponent({ width: 125, height: 250 }),
		new ColliderComponent("static"),
		new SpriteComponent("purplePortal"),
		new EffectComponent(["teleport"]),
	]),
	new DefaultEntity("Cobble", [
		new PositionComponent({ x: 2250, y: -1000 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
	new DefaultEntity("Cobble bottom left", [
		new PositionComponent({ x: 2375, y: -1250 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
	new DefaultEntity("Cobble bottom middle", [
		new PositionComponent({ x: 2500, y: -1250 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
	new DefaultEntity("Cobble bottom right", [
		new PositionComponent({ x: 2625, y: -1250 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
	new DefaultEntity("Cobble middle left", [
		new PositionComponent({ x: 2375, y: -1125 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
	new DefaultEntity("Cobble middle middle", [
		new PositionComponent({ x: 2500, y: -1125 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
	new DefaultEntity("Cobble middle right", [
		new PositionComponent({ x: 2625, y: -1125 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
	new DefaultEntity("Cobble top left", [
		new PositionComponent({ x: 2375, y: -1000 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
	new DefaultEntity("Cobble top middle", [
		new PositionComponent({ x: 2500, y: -1000 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
	new DefaultEntity("Cobble top right", [
		new PositionComponent({ x: 2625, y: -1000 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("static"),
		new SpriteComponent("cobbleBrickLight"),
	]),
];
