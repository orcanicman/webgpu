import { VelocityComponent } from "../entities/EntityComponents/VelocityComponent";
import { PositionComponent } from "../entities/EntityComponents/PositionComponent";
import { DimensionsComponent } from "../entities/EntityComponents/DimensionsComponent";
import { ControllableComponent } from "../entities/EntityComponents/ControllableComponent";
import { EffectComponent } from "../entities/EntityComponents/EffectComponent";
import { ColliderComponent } from "../entities/EntityComponents/ColliderComponent";
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
			const controllableComponent = getComponent<ControllableComponent>(entity, "controllable");

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

			if (!collidingWith.length && controllableComponent) controllableComponent.isGrounded = false;

			if (!velocityComponent) continue;
			/**
			 * After this, we know the context we reside in has a velocity component.
			 * So that is movable.
			 * We see what the entity is colliding with
			 */

			for (const collisionObject of collidingWith) {
				// Handle static collision
				if (collisionObject.colliderComponent.colliderType === "static") {
					const staticCollisionObjectEffectComponent = getComponent<EffectComponent>(
						collisionObject.entity,
						"effect",
					);
					const entityEffectComponent = getComponent<EffectComponent>(entity, "effect");

					if (!staticCollisionObjectEffectComponent || !entityEffectComponent) continue;

					for (const effect of staticCollisionObjectEffectComponent.providers) {
						entityEffectComponent?.addUniqueConsumer(effect);
					}

					continue;
				}

				const moveableObjectSides = getBoundingBoxSides(boundingBox);
				const previousMoveableObjectSides = getBoundingBoxSides(previousBoundingBox);
				const collisionObjectSides = getBoundingBoxSides(collisionObject.boundingBox);

				// Handle rigid collision
				if (collisionObject.colliderComponent.colliderType === "rigid") {
					//TODO: ugly ass shit
					handleRigidCollision(
						velocityComponent,
						moveableObjectSides,
						previousMoveableObjectSides,
						collisionObjectSides,
						positionComponent,
						boundingBox,
						controllableComponent,
					);
					continue;
				}
			}
		}
	};
}

const handleRigidCollision = (
	velocityComponent: VelocityComponent,
	moveableObjectSides: Sides,
	previousMoveableObjectSides: Sides,
	collisionObjectSides: Sides,
	positionComponent: PositionComponent,
	boundingBox: BoundingBox,
	controllableComponent?: ControllableComponent,
) => {
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
		// collision of the bottom of collisionObject
		if (
			moveableObjectSides.bottom >= collisionObjectSides.top &&
			previousMoveableObjectSides.bottom <= collisionObjectSides.top
		) {
			positionComponent.position.y = collisionObjectSides.top - boundingBox.height;
			velocityComponent.velocity.y = 0;
		}

		// collision of the top of collisionObject
		if (
			moveableObjectSides.top <= collisionObjectSides.bottom &&
			previousMoveableObjectSides.top >= collisionObjectSides.bottom
		) {
			positionComponent.position.y = collisionObjectSides.bottom;
			velocityComponent.velocity.y = 0;

			// set controllable isGrounded
			if (controllableComponent) {
				controllableComponent.isGrounded = true;
				controllableComponent.canJump = true;
			}
		}
	}
};

const getBoundingBoxSides = (boundingBox: BoundingBox): Sides => {
	return {
		right: boundingBox.x + boundingBox.width,
		left: boundingBox.x,
		top: boundingBox.y,
		bottom: boundingBox.y + boundingBox.height,
	};
};
