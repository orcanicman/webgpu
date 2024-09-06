import { AnimationSheet, PlayerAnimations } from "../types/Animation";

export const playerAnimationSheetDescriptor: AnimationSheet<PlayerAnimations> = {
	name: "playerAnimationSheet",
	width: 192,
	height: 144,
	totalFrames: 42,
	animations: [
		{
			name: "idle",
			frames: [0, 1],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "kick",
			frames: [2, 3],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "attack",
			frames: [4, 5],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "damage",
			frames: [6, 7],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "walk",
			frames: [8, 11],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "run",
			frames: [12, 15],
			width: 24,
			height: 24,
			speed: 4,
		},
		{
			name: "push",
			frames: [16, 19],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "pull",
			frames: [20, 23],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "jump",
			frames: [24, 31],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "win",
			frames: [32, 35],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "win",
			frames: [36, 39],
			width: 24,
			height: 24,
			speed: 1,
		},
		{
			name: "sit",
			frames: [40, 41],
			width: 24,
			height: 24,
			speed: 1,
		},
	],
};

export const spriteSheetDescriptors = [playerAnimationSheetDescriptor] as const;
