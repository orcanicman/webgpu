import { getComponent } from "../../helpers/getComponent";
import { Entity, System } from "../../types/ECS";
import { EffectComponent } from "../entities/EntityComponents/EffectComponent";

export class EffectSystem implements System {
	initialize = async () => {
		console.log("Effect system initialized");
	};

	update = (_timePassed: number, entities: Entity[]) => {
		for (const entity of entities) {
			const effectComponent = getComponent<EffectComponent>(entity, "effect");
			if (!effectComponent) continue;

			for (const effect of effectComponent.consumers) {
				// "consume" the effect.
				effectComponent.removeConsumerEffect(effect);

				effect.execute(entity);
			}
		}
	};
}
