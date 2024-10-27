import { getComponent } from "../../helpers/getComponent";
import { Entity, System } from "../../types/ECS";
import { EffectComponent, VelocityComponent } from "../entities/EntityComponents";

export class EffectSystem implements System {
	initialize = async () => {
		console.log("Effect system initialized");
	};

	update = (_timePassed: number, entities: Entity[]) => {
		for (const entity of entities) {
			const effectComponent = getComponent<EffectComponent>(entity, "effect");
			if (!effectComponent) continue;

			for (const effect of effectComponent.consumers) {
				switch (effect) {
					case "teleport":
						console.log("Teleport entity where? lmao");
						break;

					case "speed":
						{
							// console.log("Speed 2x");
							// console.log(entity.id);
							const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");
							// console.log(entity.components);
							if (!velocityComponent) break;

							// This wont do much since if you hold A or D the velocity gets limited with the LIMIT.
							velocityComponent.velocity.x *= 1.175;
						}
						break;

					default:
						break;
				}
				effectComponent.removeConsumerEffect(effect);
			}
		}
	};
}
