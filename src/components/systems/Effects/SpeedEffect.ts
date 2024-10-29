import { getComponent } from "../../../helpers/getComponent";
import { Entity } from "../../../types/ECS";
import { Effect } from "../../entities/EntityComponents/EffectComponent";
import { VelocityComponent } from "../../entities/EntityComponents/VelocityComponent";

export class SpeedEffect implements Effect {
	readonly id = "speed";

	constructor(private speed: number) {}

	execute = (entity: Entity) => {
		const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");
		if (!velocityComponent) return;

		velocityComponent.maxVelocity.x = velocityComponent.maxVelocity.x * this.speed.valueOf();

		setTimeout(() => {
			velocityComponent.maxVelocity.x = velocityComponent.originalMaxVelocity.x.valueOf();
		}, 500);
	};
}
