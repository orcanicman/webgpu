import { Entity } from "../../types/ECS";
import { DefaultEntity } from "./Entities";
import { SpriteComponent } from "./EntityComponents/SpriteComponent";
import { PositionComponent } from "./EntityComponents/PositionComponent";
import { DimensionsComponent } from "./EntityComponents/DimensionsComponent";
import { EffectComponent } from "./EntityComponents/EffectComponent";
import { ColliderComponent } from "./EntityComponents/ColliderComponent";
import { SpeedEffect } from "../systems/Effects/SpeedEffect";
import { TeleportEffect } from "../systems/Effects/TeleportEffect";

export class Map extends Array<Entity> {
	constructor(public items: Entity[] = []) {
		super(
			// new DefaultEntity("Brown brick", [
			// 	new PositionComponent({ x: 0, y: 300 }),
			// 	new DimensionsComponent({ width: 600, height: 300 }),
			// 	new ColliderComponent("static"),
			// 	new SpriteComponent([{source: "brownBrick"}]),
			// ]),
			new DefaultEntity("Arrow right 1", [
				new PositionComponent({ x: 0, y: 125 }),
				new DimensionsComponent({ width: 250, height: 250 }),
				new ColliderComponent("static"),
				new SpriteComponent([{ source: "blueArrow" }]),
			]),
			new DefaultEntity("Arrow right 2", [
				new PositionComponent({ x: 500, y: 125 }),
				new DimensionsComponent({ width: 250, height: 250 }),
				new ColliderComponent("static"),
				new EffectComponent([new SpeedEffect(2)]),
				new SpriteComponent([{ source: "blueArrow" }]),
			]),
			new DefaultEntity("Arrow right 3", [
				new PositionComponent({ x: 1000, y: 125 }),
				new DimensionsComponent({ width: 250, height: 250 }),
				new ColliderComponent("static"),
				new SpriteComponent([{ source: "blueArrow" }]),
			]),
			new DefaultEntity("Blue wall Top left", [
				new PositionComponent({ x: 0, y: 500 }),
				new DimensionsComponent({ width: 1250, height: 800 }),
				new ColliderComponent("rigid"),
				new SpriteComponent([{ source: "blueTexture" }]),
			]),
			new DefaultEntity("Blue wall Bottom left", [
				new PositionComponent({ x: -5000, y: -1500 }),
				new DimensionsComponent({ width: 6500, height: 1500 }),
				new ColliderComponent("rigid"),
				new SpriteComponent([{ source: "blueTexture" }]),
			]),
			new DefaultEntity("Blue wall right", [
				new PositionComponent({ x: 1750, y: -1000 }),
				new DimensionsComponent({ width: 500, height: 1000 }),
				new ColliderComponent("rigid"),
				new SpriteComponent([{ source: "blueTexture" }]),
			]),
			new DefaultEntity("Blue wall bottom right", [
				new PositionComponent({ x: 1500, y: -1500 }),
				new DimensionsComponent({ width: 1000, height: 250 }),
				new ColliderComponent("rigid"),
				new SpriteComponent([{ source: "blueTexture" }]),
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
		new SpriteComponent([{ source: "purplePortal" }]),
		new EffectComponent([new TeleportEffect({ x: 0, y: 0 })]),
	]),
	new DefaultEntity("Cobble top portal", [
		new PositionComponent({ x: 2250, y: -1000 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("rigid"),
		new SpriteComponent([{ source: "cobbleBrickLight" }]),
	]),
	new DefaultEntity("Cobble bottom", [
		new PositionComponent({ x: 2375, y: -1250 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("rigid"),
		new SpriteComponent([{ source: "cobbleBrickLight" }]),
	]),
	new DefaultEntity("Cobble middle", [
		new PositionComponent({ x: 2375, y: -1125 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("rigid"),
		new SpriteComponent([{ source: "cobbleBrickLight" }]),
	]),
	new DefaultEntity("Cobble top", [
		new PositionComponent({ x: 2375, y: -1000 }),
		new DimensionsComponent({ width: 125, height: 125 }),
		new ColliderComponent("rigid"),
		new SpriteComponent([{ source: "cobbleBrickLight" }]),
	]),

	/** Backgrounds */

	// new DefaultEntity("Cobble background", [
	// 	new PositionComponent({ x: 2125, y: -1125 }),
	// 	new DimensionsComponent({ width: 125, height: 125 }),
	// 	new ColliderComponent("static"),
	// 	new SpriteComponent([{ source: "cobbleBrick" }]),
	// ]),
];
