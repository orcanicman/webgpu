import { GravityComponent, VelocityComponent } from "../entities/EntityComponents";
import { GRAVITY } from "../../config/GRAVITY";
import { getComponent } from "../../helpers/getComponent";
import { Entity, System } from "../../types/ECS";

export class GravitySystem implements System {
	initialize = async () => {
		console.log("Gravity system initialized.");
	};

	update = (timePassed: number, entities: Entity[]) => {
		for (const entity of entities) {
			const gravityComponent = getComponent<GravityComponent>(entity, "gravity");
			const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");

			if (!gravityComponent || !velocityComponent) continue;

			velocityComponent.velocity.y -= GRAVITY * gravityComponent.mass * (timePassed / 1000);
		}
	};
}
