import {
	ColliderComponent,
	DimensionsComponent,
	PositionComponent,
	VelocityComponent,
} from "../entities/EntityComponents";
import { getComponent } from "../../helpers/getComponent";
import { intersects } from "../../helpers/intersects";
import { BoundingBox } from "../../types/BoundingBox";
import { Entity, System } from "../../types/ECS";

type Sides = { right: number; left: number; top: number; bottom: number };

export class CollisionSystem implements System {
	initialize = async () => {
		console.log("Collision system initialized.");
	};

	update = (timePassed: number, entities: Entity[]) => {
		const collisionObjects: { boundingBox: BoundingBox; entity: Entity; colliderComponent: ColliderComponent }[] =
			[];

		for (const entity of entities) {
			// Get components
			const colliderComponent = getComponent<ColliderComponent>(entity, "collider");
			const positionComponent = getComponent<PositionComponent>(entity, "position");
			const dimensionsComponent = getComponent<DimensionsComponent>(entity, "dimensions");

			// Velocity component
			const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");

			if (!colliderComponent || !positionComponent || !dimensionsComponent) continue;

			const previousBoundingBox = { ...positionComponent.previousPosition, ...dimensionsComponent.dimensions };
			const boundingBox = { ...positionComponent.position, ...dimensionsComponent.dimensions };

			// If colliderType is not Dynamic e.g. movable. Just add it to collisionObjects.
			if (!(colliderComponent.colliderType === "dynamic")) {
				collisionObjects.push({
					boundingBox,
					entity,
					colliderComponent,
				});
				continue;
			}

			const collidingWith = collisionObjects.filter((collisionObject) =>
				intersects(collisionObject.boundingBox, boundingBox),
			);

			if (!velocityComponent) continue;

			for (const collisionObject of collidingWith) {
				const moveableObjectSides = getBoundingBoxSides(boundingBox);
				const previousMoveableObjectSides = getBoundingBoxSides(previousBoundingBox);

				const collisionObjectSides = getBoundingBoxSides(collisionObject.boundingBox);

				if (collisionObject.colliderComponent.colliderType === "rigid") {
					// check horizontal
					if (velocityComponent.velocity.x !== 0) {
						// collision on the left of collisionObject
						if (
							moveableObjectSides.right >= collisionObjectSides.left &&
							previousMoveableObjectSides.right <= collisionObjectSides.left
						) {
							positionComponent.position.x = collisionObjectSides.left - boundingBox.width;
							velocityComponent.velocity.x = 0;
						}

						// collision on the right of collisionObject
						if (
							moveableObjectSides.left <= collisionObjectSides.right &&
							previousMoveableObjectSides.left >= collisionObjectSides.right
						) {
							positionComponent.position.x = collisionObjectSides.right;
							velocityComponent.velocity.x = 0;
						}
					}

					if (velocityComponent.velocity.y !== 0) {
						// collision of the top of collisionObject
						if (
							moveableObjectSides.bottom >= collisionObjectSides.top &&
							previousMoveableObjectSides.bottom <= collisionObjectSides.top
						) {
							positionComponent.position.y = collisionObjectSides.top - boundingBox.height;
							velocityComponent.velocity.y = 0;
						}

						// collision of the bottom of collisionObject
						if (
							moveableObjectSides.top <= collisionObjectSides.bottom &&
							previousMoveableObjectSides.top >= collisionObjectSides.bottom
						) {
							positionComponent.position.y = collisionObjectSides.bottom;
							velocityComponent.velocity.y = 0;
						}
					}
					continue;
				}

				if (collisionObject.colliderComponent.colliderType === "static") {
					// Handle collision with static object
					continue;
				}
			}
		}
	};
}

const getBoundingBoxSides = (boundingBox: BoundingBox): Sides => {
	return {
		right: boundingBox.x + boundingBox.width,
		left: boundingBox.x,
		top: boundingBox.y,
		bottom: boundingBox.y + boundingBox.height,
	};
};
