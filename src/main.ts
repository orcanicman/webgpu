import { CollisionSystem } from "./components/systems/CollisionSystem";
import {
	ColliderComponent,
	ControllableComponent,
	DimensionsComponent,
	GravityComponent,
	PositionComponent,
	SpriteComponent,
	VelocityComponent,
} from "./components/entities/EntityComponents";
import { DefaultEntity } from "./components/entities/Entities";
import { Game } from "./Game";
import { GravitySystem } from "./components/systems/GravitySystem";
import { MovementSystem } from "./components/systems/MovementSystem";
import { RenderSystem } from "./components/systems/RenderSystem";
import { Entity, System } from "./types/ECS";

/**
 * Creates a canvas instance onto the spefied `root` element and returns its webgpu context.
 * @param root HTMLElement | null
 * @returns GPUCanvasContext
 */
const initializeCanvas = (root: HTMLElement | null) => {
	const canvas = document.createElement("canvas");
	canvas.width = 800;
	canvas.height = 600;
	const context = canvas.getContext("webgpu");

	if (!root) throw Error("Root element not found, please specify it.");
	if (!context) throw Error("Could not get the rendering context from canvas.");
	root.appendChild(canvas);

	return context;
};

/**
 * TODO
 * Clean up code (split into multiple components)
 */
const main = async () => {
	const context = initializeCanvas(document.getElementById("root"));

	const entities: Entity[] = [
		new DefaultEntity("0", [
			new PositionComponent({ x: 75, y: 530 }),
			new DimensionsComponent({ height: 25, width: 50 }),
			new ColliderComponent("rigid"),
			new SpriteComponent("uvTestTexture"),
		]),
		new DefaultEntity("0", [
			new PositionComponent({ x: 0, y: 0 }),
			new DimensionsComponent({ height: 50, width: 250 }),
			new ColliderComponent("rigid"),
			new SpriteComponent("uvTestTexture"),
		]),

		new DefaultEntity("1", [
			new PositionComponent({ x: 100, y: 300 }),
			new DimensionsComponent({ width: 50, height: 75 }),
			new VelocityComponent({ x: 0, y: 0 }, { x: 750, y: 500 }),
			new ControllableComponent(1000),
			new GravityComponent(80),
			new ColliderComponent("dynamic"),
			new SpriteComponent("playerTexture"),
		]),
	];

	const systems: System[] = [
		new MovementSystem(window),
		new CollisionSystem(),
		new GravitySystem(),
		new RenderSystem(context),
	];

	const game = new Game(context, entities, systems);

	await game.initialize();
	game.loop(0);
};

main();
