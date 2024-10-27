import { AnimationSheet, PlayerAnimations } from "../../types/Animation";
import { Dimensions2D } from "../../types/Dimensions2D";
import { Component } from "../../types/ECS";
import { Vector2 } from "../../types/Vector2";
import { Content } from "../systems/RenderSystem";

export class ColliderComponent implements Component {
	readonly type = "collider";
	public isColliding = false;

	constructor(public colliderType: "rigid" | "static" | "dynamic") {}
}

export type Effect = "teleport" | "speed";

export class EffectComponent implements Component {
	readonly type = "effect";

	constructor(
		public providers: Effect[] = [],
		public consumers: Effect[] = [],
	) {}

	public addUniqueProvider = (effect: Effect) => {
		if (this.providers.includes(effect)) return;
		this.providers.push(effect);
	};

	public addUniqueConsumer = (effect: Effect) => {
		if (this.consumers.includes(effect)) return;
		this.consumers.push(effect);
	};

	public removeProviderEffect = (effect: Effect) => {
		const help = this.providers.filter((compEffect) => compEffect !== effect);
		this.providers = help;
	};

	public removeConsumerEffect = (effect: Effect) => {
		const consumers = this.consumers.filter((compEffect) => compEffect !== effect);
		this.consumers = consumers;
	};
}

export class ControllableComponent implements Component {
	readonly type = "controllable";
	constructor(
		public speed: number,
		public isGrounded: boolean = false,
		public canJump: boolean = true,
	) {}
}

export class DimensionsComponent implements Component {
	readonly type = "dimensions";
	constructor(public dimensions: Dimensions2D) {}
}

export class GravityComponent implements Component {
	readonly type = "gravity";
	constructor(public mass: number) {}
}

export class PositionComponent implements Component {
	readonly type = "position";

	constructor(
		public position: Vector2,
		public previousPosition: Vector2 = { x: position.x.valueOf(), y: position.y.valueOf() },
	) {}
}

export class SpriteComponent implements Component {
	readonly type = "sprite";
	constructor(public source: keyof (typeof Content)["textures"]) {}
}

export class AnimationComponent implements Component {
	readonly type = "animation";

	constructor(
		public animationSheet: AnimationSheet<PlayerAnimations>,
		/**
		 * Time in ms
		 */
		public timePerFrame: number,
		public currentAnimation: (typeof animationSheet)["animations"][number],
		public currentFrame = 0,
		public timePassed = 0,
		public facingDirection: "right" | "left" = "right",
	) {}
}

export class CameraFocusComponent implements Component {
	readonly type = "camera_focus";
	constructor() {}
}

export class VelocityComponent implements Component {
	readonly type = "velocity";
	constructor(
		public velocity: Vector2,
		public maxVelocity: Vector2 = { x: Infinity, y: Infinity },
	) {}
}
