import { getComponent } from "../../helpers/getComponent";
import { Entity, System } from "../../types/ECS";
import { AnimationComponent } from "../entities/EntityComponents/AnimationComponent";

export class AnimationSystem implements System {
	initialize = async () => {
		console.log("Animation system initialized.");
	};

	update = (timePassed: number, entities: Entity[]) => {
		for (const entity of entities) {
			const animationComponent = getComponent<AnimationComponent>(entity, "animation");
			if (!animationComponent) continue;

			const [firstFrame, lastFrame] = animationComponent.currentAnimation.frames;

			if (animationComponent.currentFrame < firstFrame) {
				animationComponent.currentFrame = firstFrame;
			}

			const newTimePassed = animationComponent.timePassed + timePassed;
			if (!(newTimePassed >= animationComponent.timePerFrame / animationComponent.currentAnimation.speed)) {
				animationComponent.timePassed = newTimePassed;
				continue;
			}

			animationComponent.timePassed = 0;

			if (animationComponent.currentFrame + 1 > lastFrame) {
				animationComponent.currentFrame = firstFrame;
				continue;
			}

			animationComponent.currentFrame += 1;
		}
	};
}
