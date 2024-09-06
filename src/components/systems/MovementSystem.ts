import {
	AnimationComponent,
	ControllableComponent,
	PositionComponent,
	VelocityComponent,
} from "../entities/EntityComponents";
import { MovementKeys } from "../../config/MovementKeys";
import { getComponent } from "../../helpers/getComponent";
import { Entity, System } from "../../types/ECS";

export class MovementSystem implements System {
	constructor(public window: Window) {}

	initialize = async () => {
		// Will cause a memory leak when multiple movement systems are made. Too bad!
		this.window.addEventListener("keydown", this.handleKeyDown);
		this.window.addEventListener("keyup", this.handleKeyUp);
	};

	keyboardState: Record<MovementKeys, boolean> = {
		a: false,
		w: false,
		s: false,
		d: false,
		" ": false,
	};

	private movementKeys: MovementKeys[] = ["a", "w", "s", "d", " "];

	handleKeyDown = (event: KeyboardEvent) => {
		const key = event.key as MovementKeys;
		if (this.movementKeys.includes(key)) {
			this.setMovementKeyState(key, true);
		}
	};

	handleKeyUp = (event: KeyboardEvent) => {
		const key = event.key as MovementKeys;
		if (this.movementKeys.includes(key)) {
			this.setMovementKeyState(key, false);
		}
	};

	setMovementKeyState(key: MovementKeys, state: boolean) {
		this.keyboardState[key] = state;
	}

	update = (timePassed: number, entities: Entity[]) => {
		for (const entity of entities) {
			const controllableComponent = getComponent<ControllableComponent>(entity, "controllable");
			const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");
			const positionComponent = getComponent<PositionComponent>(entity, "position");
			const animationComponent = getComponent<AnimationComponent>(entity, "animation");

			// Don't change anything if it's not supposed to be controlled
			if (!controllableComponent || !positionComponent || !velocityComponent) continue;

			// Update velocity accordingly
			const velocityDelta = controllableComponent.speed * (timePassed / 1000);
			this.hanldeKeyboardStates(velocityDelta, velocityComponent, animationComponent);

			// Brake if letting go
			this.handleBraking(velocityDelta, velocityComponent, animationComponent);

			// set old position
			positionComponent.previousPosition.x = positionComponent.position.x.valueOf();
			positionComponent.previousPosition.y = positionComponent.position.y.valueOf();

			// Turn velocity into actual movement
			positionComponent.position.x += velocityComponent.velocity.x * (timePassed / 1000);
			positionComponent.position.y += velocityComponent.velocity.y * (timePassed / 1000);
		}
	};

	hanldeKeyboardStates(
		velocityDelta: number,
		velocityComponent: VelocityComponent,
		animationComponent?: AnimationComponent,
	) {
		if (this.keyboardState.a) {
			if (animationComponent) {
				animationComponent.facingDirection = "left";

				animationComponent.currentAnimation = animationComponent.animationSheet.animations.find(
					(animation) => animation.name === "run",
				)!;
			}
			velocityComponent.velocity.x -= velocityDelta;
			this.limitVelocity("x", velocityComponent);
		}

		if (this.keyboardState.d) {
			if (animationComponent) {
				animationComponent.facingDirection = "right";

				animationComponent.currentAnimation = animationComponent.animationSheet.animations.find(
					(animation) => animation.name === "run",
				)!;
			}
			velocityComponent.velocity.x += velocityDelta;
			this.limitVelocity("x", velocityComponent);
		}

		if (this.keyboardState[" "]) {
			this.jump(velocityComponent);
		}
	}

	handleBraking(
		velocityDelta: number,
		velocityComponent: VelocityComponent,
		animationComponent?: AnimationComponent,
	) {
		const brakingFactor = 3.5;

		if (velocityComponent.velocity.x > 0 && !this.keyboardState.d) {
			velocityComponent.velocity.x -= brakingFactor * velocityDelta;

			if (velocityComponent.velocity.x < 0) {
				velocityComponent.velocity.x = 0;
			}
		}

		if (velocityComponent.velocity.x < 0 && !this.keyboardState.a) {
			velocityComponent.velocity.x += brakingFactor * velocityDelta;

			if (velocityComponent.velocity.x > 0) {
				velocityComponent.velocity.x = 0;
			}
		}

		if (velocityComponent.velocity.x === 0) {
			if (animationComponent) {
				animationComponent.currentAnimation = animationComponent.animationSheet.animations.find(
					(animation) => animation.name === "idle",
				)!;
			}
		}
	}

	limitVelocity(axis: "x" | "y", velocityComponent: VelocityComponent) {
		const velocity = velocityComponent.velocity[axis];
		const maxVelocity = velocityComponent.maxVelocity[axis];

		if (velocity > maxVelocity) {
			velocityComponent.velocity[axis] = maxVelocity;
		} else if (velocity < -maxVelocity) {
			velocityComponent.velocity[axis] = -maxVelocity;
		}
	}

	jump(velocityComponent: VelocityComponent) {
		velocityComponent.velocity.y = 1000;
	}
}
