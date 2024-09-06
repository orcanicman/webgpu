import { Content } from "../components/systems/RenderSystem";

export type AnimationSheet<AnimationKeys = unknown> = {
	readonly name: keyof (typeof Content)["animationSheets"];
	readonly width: number;
	readonly height: number;
	readonly totalFrames: number;
	readonly animations: Animation<AnimationKeys>[];
};

/**
 * So i think the currentFrame should just inhibit the context of the animationSheet.
 * If the animationSheet is like 0-25. And the animation itself is like 5-10
 * then the currentFrame should also between 5 and 10.
 */
type Animation<AnimationKeys = unknown> = {
	readonly name: AnimationKeys;
	readonly frames: [number, number];
	readonly speed: number;
	readonly width: number;
	readonly height: number;
};

export type PlayerAnimations =
	| "idle"
	| "kick"
	| "attack"
	| "damage"
	| "walk"
	| "run"
	| "push"
	| "pull"
	| "jump"
	| "win"
	| "sit";
