import { getComponent } from "../../../helpers/getComponent";
import { Entity } from "../../../types/ECS";
import { Effect } from "../../entities/EntityComponents/EffectComponent";
import { VelocityComponent } from "../../entities/EntityComponents/VelocityComponent";

export class SpeedEffect implements Effect {
	readonly id = "speed";
	public isActive = false;

	private instance: number = 0;

	constructor(private speed: number) {}

	execute = (entity: Entity) => {
		const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");
		if (!velocityComponent) return;

		this.isActive = true;

		/** Check if this is the instance. (so the timeout wont cancel the effect prematurely) */
		const instance = this.instance + 1;
		this.instance = instance;

		velocityComponent.maxVelocity.x = velocityComponent.maxVelocity.x * this.speed.valueOf();

		setTimeout(() => {
			if (this.instance !== instance) return;

			velocityComponent.maxVelocity.x = velocityComponent.originalMaxVelocity.x.valueOf();
			this.isActive = false;
		}, 500);
	};
}
