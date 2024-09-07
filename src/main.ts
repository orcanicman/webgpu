import { CollisionSystem } from "./components/systems/CollisionSystem";
import {
	ColliderComponent,
	DimensionsComponent,
	PositionComponent,
	SpriteComponent,
} from "./components/entities/EntityComponents";
import { DefaultEntity } from "./components/entities/Entities";
import { Game } from "./Game";
import { GravitySystem } from "./components/systems/GravitySystem";
import { MovementSystem } from "./components/systems/MovementSystem";
import { RenderSystem } from "./components/systems/RenderSystem";
import { Entity, System } from "./types/ECS";
import { Player } from "./components/entities/Player";
import { AnimationSystem } from "./components/systems/AnimationSystem";
import { Map } from "./components/entities/Map";

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

	const entities: Entity[] = [...new Map(), new Player("Player")];

	const systems: System[] = [
		new MovementSystem(window),
		new CollisionSystem(),
		new GravitySystem(),
		new AnimationSystem(),
		new RenderSystem(context),
	];

	const game = new Game(context, entities, systems);

	await game.initialize();
	game.loop(0);
};

main();
