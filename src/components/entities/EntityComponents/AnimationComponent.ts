import { AnimationSheet, PlayerAnimations } from "../../../types/Animation";
import { Component } from "../../../types/ECS";

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
