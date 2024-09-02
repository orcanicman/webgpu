import { ControllableComponent, PositionComponent, VelocityComponent } from "../entities/EntityComponents";
import { MovementKeys } from "../../config/MovementKeys";
import { getComponent } from "../../helpers/getComponent";
import { Entity, System } from "../../types/ECS";

export class MovementSystem implements System {
	constructor(public window: Window) {
		this.init();
	}

	initialize = async () => {
		console.log("Movement system initialized.");
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

	init = () => {
		// Will cause a memory leak when multiple movement systems are made. Too bad!
		this.window.addEventListener("keydown", this.handleKeyDown);
		this.window.addEventListener("keyup", this.handleKeyUp);
	};

	update = (timePassed: number, entities: Entity[]) => {
		for (const entity of entities) {
			const controllableComponent = getComponent<ControllableComponent>(entity, "controllable");
			const velocityComponent = getComponent<VelocityComponent>(entity, "velocity");
			const positionComponent = getComponent<PositionComponent>(entity, "position");

			// Don't change anything if it's not supposed to be controlled
			if (!controllableComponent || !positionComponent || !velocityComponent) continue;

			// Update velocity accordingly
			const velocityDelta = controllableComponent.speed * (timePassed / 1000);
			this.updatePlayerVelocity(velocityDelta, velocityComponent);

			// Brake if letting go
			this.handleBraking(velocityDelta, velocityComponent);

			// set old position
			positionComponent.previousPosition.x = positionComponent.position.x.valueOf();
			positionComponent.previousPosition.y = positionComponent.position.y.valueOf();

			// Turn velocity into actual movement
			positionComponent.position.x += velocityComponent.velocity.x * (timePassed / 1000);
			positionComponent.position.y += velocityComponent.velocity.y * (timePassed / 1000);
		}
	};

	updatePlayerVelocity(velocityDelta: number, velocityComponent: VelocityComponent) {
		if (this.keyboardState.a) {
			velocityComponent.velocity.x -= velocityDelta;
			this.limitVelocity("x", velocityComponent);
		}

		if (this.keyboardState.d) {
			velocityComponent.velocity.x += velocityDelta;
			this.limitVelocity("x", velocityComponent);
		}

		if (this.keyboardState[" "]) {
			this.jump(velocityComponent);
		}

		// DEBUG:
		// if (this.keyboardState.w) {
		//   velocityComponent.velocity.y -= velocityDelta;
		//   this.limitVelocity("y", velocityComponent);
		// }

		// if (this.keyboardState.s) {
		//   velocityComponent.velocity.y += velocityDelta;
		//   this.limitVelocity("y", velocityComponent);
		// }
	}

	handleBraking(velocityDelta: number, velocityComponent: VelocityComponent) {
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

		// DEBUG:
		// if (velocityComponent.velocity.y < 0 && !this.keyboardState.w) {
		//   velocityComponent.velocity.y -= brakingFactor * velocityDelta;

		//   if (velocityComponent.velocity.y < 0) {
		//     velocityComponent.velocity.y = 0;
		//   }
		// }

		// if (velocityComponent.velocity.y > 0 && !this.keyboardState.s) {
		//   velocityComponent.velocity.y += brakingFactor * velocityDelta;

		//   if (velocityComponent.velocity.y > 0) {
		//     velocityComponent.velocity.y = 0;
		//   }
		// }
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
		velocityComponent.velocity.y = 150;
	}
}
