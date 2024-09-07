export class WindowManager {
	previousTimestamp = 0;
	accumulatedTime = 0;
	animationFrameId: number | null = null;

	canvas: HTMLCanvasElement;
	constructor(private context: GPUCanvasContext) {
		this.canvas = context.canvas as HTMLCanvasElement;
	}

	initialize = async (callback: (timestamp: number) => void) => {
		this.initializeCanvas();
		this.initializeLoop(callback);
		this.resizeCanvasToDisplaySize();
	};

	private initializeCanvas = () => {
		this.canvas.style.display = "block";
		this.canvas.style.width = "100vw";
		this.canvas.style.height = "100vh";
	};

	private initializeLoop = (loop: (timestamp: number) => void) => {
		const onFocus = () => {
			if (!this.animationFrameId) {
				// Resume the game loop
				this.previousTimestamp = performance.now();
				window.requestAnimationFrame(loop);
			}
		};

		const onBlur = () => {
			// Pause the game loop
			if (this.animationFrameId) {
				window.cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
		};

		window.addEventListener("focus", onFocus);
		window.addEventListener("blur", onBlur);

		// initialize first loop
		onFocus();
	};

	public resizeCanvasToDisplaySize = () => {
		const canvas = this.canvas;

		// Lookup the size the browser is displaying the canvas in CSS pixels.
		const displayWidth = canvas.clientWidth;
		const displayHeight = canvas.clientHeight;

		// Check if the canvas is not the same size.
		const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

		if (needResize) {
			// Make the canvas the same size
			canvas.width = displayWidth;
			canvas.height = displayHeight;
		}

		return needResize;
	};
}
