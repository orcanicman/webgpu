import { FPS } from "./config/FPS";
import { Entity, System } from "./types/ECS";
import { WindowManager } from "./WindowManager";

export class Game {
	windowManager!: WindowManager;

	constructor(
		private context: GPUCanvasContext,
		private entities: Entity[] = [],
		private systems: System[] = [],
	) {}

	public initialize = async () => {
		for (const system of this.systems) {
			await system.initialize();
		}

		const windowManager = new WindowManager(this.context);
		this.windowManager = windowManager;
		windowManager.initialize(this.loop);
	};

	public loop = (time: number) => {
		const frameTime = 1000 / FPS;
		const deltaTime = time - this.windowManager.previousTimestamp;
		this.windowManager.previousTimestamp = time;
		this.windowManager.accumulatedTime += deltaTime;

		while (this.windowManager.accumulatedTime >= frameTime) {
			this.update(frameTime);
			this.windowManager.accumulatedTime -= frameTime;
		}

		this.windowManager.animationFrameId = window.requestAnimationFrame(this.loop);
	};

	private update = (timePassed: number) => {
		// Make sure window is always correct size.
		this.windowManager.resizeCanvasToDisplaySize();

		for (const system of this.systems) {
			system.update(timePassed, this.entities);
		}
	};
}
