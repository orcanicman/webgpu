import { Content } from "../components/systems/RenderSystem";

export type AnimationSheet = {
	name: keyof typeof Content;
	width: number;
	height: number;
	totalFrames: number;
	animations: Animation[];
};

/**
 * So i think the currentFrame should just inhibit the context of the animationSheet.
 * If the animationSheet is like 0-25. And the animation itself is like 5-10
 * then the currentFrame should also between 5 and 10.
 */
export type Animation = { name: string; currentFrame: number; frames: [number, number]; timePassed: number };
