import { getComponent } from "../../helpers/getComponent";
import { Entity, System } from "../../types/ECS";
import { AnimationPoolComponent } from "../entities/EntityComponents";

export class AnimationSystem implements System {
	initialize = async () => {
		console.log("Animation system initialized.");
	};

	update = (timePassed: number, entities: Entity[]) => {
		for (const entity of entities) {
			const animationPool = getComponent<AnimationPoolComponent>(entity, "animation");

			if (!animationPool || !animationPool.currentAnimation) continue;

			const newTimePassed = animationPool.currentAnimation.timePassed + timePassed;
			const frameStart = animationPool.currentAnimation.frames[0];
			const frameEnd = animationPool.currentAnimation.frames[1];
		}
	};
}
