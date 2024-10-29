import { getComponent } from "../../../helpers/getComponent";
import { Entity } from "../../../types/ECS";
import { Vector2 } from "../../../types/Vector2";
import { Effect } from "../../entities/EntityComponents/EffectComponent";
import { PositionComponent } from "../../entities/EntityComponents/PositionComponent";
import { VelocityComponent } from "../../entities/EntityComponents/VelocityComponent";

export class TeleportEffect implements Effect {
	readonly id = "teleport";

	constructor(private target: Vector2) {}

	execute = (entity: Entity) => {
		const positionComponent = getComponent<PositionComponent>(entity, "position");
		const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");
		if (!positionComponent || !velocityComponent) return;

		positionComponent.position = { x: this.target.x.valueOf(), y: this.target.y.valueOf() };
		// velocityComponent.velocity = { x: 0, y: 0 };
	};
}
