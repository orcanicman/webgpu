import { BufferUtil } from "../../utils/BufferUtil";
import { getComponent } from "../../helpers/getComponent";
import { QuadGeometry } from "../../helpers/StaticGeometry";
import { Texture } from "../../utils/Texture";
import { System, Entity } from "../../types/ECS";
import {
	PositionComponent,
	DimensionsComponent,
	SpriteComponent,
	CameraFocusComponent,
	AnimationComponent,
} from "../entities/EntityComponents";
import { BoundingBox } from "../../types/BoundingBox";
import { Vector2 } from "../../types/Vector2";
import { getPositionValues2d } from "../../utils/getDivisionWithRemainder";
import { TickSpeed } from "../../config/TickSpeed";
import { SpritePipeline } from "./SpritePipeline";

export class RenderSystem implements System {
	device!: GPUDevice;

	renderPipeline!: GPURenderPipeline;

	renderPass!: GPURenderPassEncoder;

	// todo: remove/refactor
	cameraPosition!: Vector2;

	buffers!: {
		resolutionBuffer: GPUBuffer;
		cameraBuffer: GPUBuffer;
	};

	spritePipelines: { pipeline: SpritePipeline; entity: Entity }[] = [];

	constructor(private context: GPUCanvasContext) {}

	public initialize = async () => {
		const { device } = await this.initializeDevice();

		await Content.initialize(device);

		const cameraPosition = { x: 0, y: 0 };

		const resolutionBuffer = BufferUtil.createResolutionBuffer(
			device,
			new Float32Array([this.context.canvas.width, this.context.canvas.height]),
		);

		const cameraBuffer = BufferUtil.createCameraBuffer(
			device,
			new Float32Array([cameraPosition.x, cameraPosition.y]),
		);

		this.cameraPosition = cameraPosition;
		this.buffers = { resolutionBuffer, cameraBuffer };
		this.device = device;
	};

	public update = (_timePassed: number, entities: Entity[]) => {
		const encoder = this.device.createCommandEncoder();

		const renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: this.context.getCurrentTexture().createView(),
					loadOp: "clear",
					clearValue: { r: 0.85, g: 0.85, b: 0.85, a: 1 },
					storeOp: "store",
				},
			],
		});

		this.renderPass = renderPass;

		/**
		 * updateBuffers
		 */
		this.device.queue.writeBuffer(
			this.buffers.resolutionBuffer,
			0,
			new Float32Array([this.context.canvas.width, this.context.canvas.height]),
		);
		this.device.queue.writeBuffer(
			this.buffers.cameraBuffer,
			0,
			new Float32Array([this.cameraPosition.x, this.cameraPosition.y]),
		);

		// DRAW HERE
		for (const entity of entities) {
			const positionComponent = getComponent<PositionComponent>(entity, "position");
			const dimensionsComponent = getComponent<DimensionsComponent>(entity, "dimensions");
			const spriteComponent = getComponent<SpriteComponent>(entity, "sprite");
			const cameraFocusComponent = getComponent<CameraFocusComponent>(entity, "camera_focus");
			const animationComponent = getComponent<AnimationComponent>(entity, "animation");

			// Don't draw anything if entity does not have a position or dimensions.
			if (!positionComponent || !dimensionsComponent || !spriteComponent) continue;

			if (cameraFocusComponent) {
				const cameraTargetPosition = {
					x: positionComponent.position.x - this.context.canvas.width / 2,
					y: positionComponent.position.y - this.context.canvas.height / 2,
				};

				this.cameraPosition.x += (cameraTargetPosition.x - this.cameraPosition.x) * (12 / TickSpeed);
				this.cameraPosition.y += (cameraTargetPosition.y - this.cameraPosition.y) * (12 / TickSpeed);
			}

			const UV: { u: [number, number, number, number]; v: [number, number, number, number] } = {
				u: [0, 1, 1, 0],
				v: [1, 1, 0, 0],
			};

			let texture = Content["textures"][spriteComponent.source] as Texture;

			if (animationComponent && animationComponent.currentAnimation) {
				texture = Content["animationSheets"][animationComponent.animationSheet.name] as Texture;

				const animationFrameSet = animationComponent.currentAnimation;

				const { x, y } = getPositionValues2d(
					texture.width,
					animationFrameSet.width,
					animationComponent.currentFrame,
				);

				const u0 =
					(x + (animationComponent.facingDirection === "right" ? 0 : animationFrameSet.width)) /
					texture.width;
				const v0 = (y + 0.1) / texture.height;

				const u1 =
					(x + (animationComponent.facingDirection === "right" ? animationFrameSet.width : 0)) /
					texture.width;
				const v1 = (y + 0.1 + animationFrameSet.height) / texture.height;

				UV.u = [u0, u1, u1, u0];
				UV.v = [v1, v1, v0, v0];
			}

			const spritePipeline = this.getSpritePipeline(entity, texture);

			this.drawSprite(
				spritePipeline,
				{
					...positionComponent.position,
					...dimensionsComponent.dimensions,
				},
				UV,
			);
		}

		renderPass.end();
		this.device.queue.submit([encoder.finish()]);
	};

	public drawSprite = (
		spritePipeline: SpritePipeline,
		boundingBox: BoundingBox,
		UV: { u: [number, number, number, number]; v: [number, number, number, number] },
	) => {
		const geometryData = new QuadGeometry(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height, UV);

		const vertexBuffer = BufferUtil.createVertexBuffer(this.device, new Float32Array(geometryData.vertices));
		const indexBuffer = BufferUtil.createIndexBuffer(this.device, new Uint16Array(geometryData.inidices));

		this.renderPass.setPipeline(spritePipeline.pipeline);
		this.renderPass.setIndexBuffer(indexBuffer, "uint16");
		this.renderPass.setVertexBuffer(0, vertexBuffer);

		this.renderPass.setBindGroup(0, spritePipeline.resolutionBindGroup);
		this.renderPass.setBindGroup(1, spritePipeline.cameraBindGroup);
		this.renderPass.setBindGroup(2, spritePipeline.textureBindGroup);
		this.renderPass.drawIndexed(geometryData.inidices.length);
	};

	private getSpritePipeline = (entity: Entity, texture: Texture): SpritePipeline => {
		let spritePipeline = this.spritePipelines.find((spritePipeline) => spritePipeline.entity === entity);
		if (!spritePipeline) {
			spritePipeline = {
				pipeline: SpritePipeline.create(
					this.device,
					texture,
					this.buffers.resolutionBuffer,
					this.buffers.cameraBuffer,
				),
				entity: entity,
			};
			this.spritePipelines.push(spritePipeline);
		}

		return spritePipeline.pipeline;
	};

	/**
	 * Checks if the program can use the gpu, creates canvas context and configures it.
	 * @returns [GPUCanvasContext, GPUDevice]
	 */
	private initializeDevice = async () => {
		if (!navigator.gpu) throw Error("Can not initialize gpu");

		const adapter = await navigator.gpu.requestAdapter();
		if (!adapter) throw Error("Could not request adapter");

		const device = await adapter.requestDevice();
		if (!device) throw Error("Could not request device");

		const format = navigator.gpu.getPreferredCanvasFormat();

		this.context.configure({
			device: device,
			format: format,
		});

		return { device };
	};
}

/**
 * Loads in textures that will be used.
 */
export class Content {
	public static textures: {
		uvTestTexture: Texture;
		playerTexture: Texture;
		redTexture: Texture;
		blueTexture: Texture;
		redHitbox: Texture;
		brownBrick: Texture;
		blueArrow: Texture;
		purplePortal: Texture;
		cobbleBrick: Texture;
	};

	public static animationSheets: {
		playerAnimationSheet: Texture;
	};

	public static async initialize(device: GPUDevice) {
		console.log("Render system initialized.");
		this.textures = {
			playerTexture: await Texture.createTextureFromURL(device, "/assets/transparent_16x16.png"),
			redHitbox: await Texture.createTextureFromURL(device, "/assets/red_hitbox.png"),
			redTexture: await Texture.createTextureFromURL(device, "/assets/red_16x32.png"),
			blueTexture: await Texture.createTextureFromURL(device, "/assets/blue_16x16.png"),
			uvTestTexture: await Texture.createTextureFromURL(device, "/assets/uv_test.png"),
			brownBrick: await Texture.createTextureFromURL(device, "/assets/brown_brick_16x16.png"),
			blueArrow: await Texture.createTextureFromURL(device, "/assets/Arrow.png"),
			purplePortal: await Texture.createTextureFromURL(device, "/assets/Portal_16x32.png"),
			cobbleBrick: await Texture.createTextureFromURL(device, "/assets/cobble_16x16.png"),
		};

		this.animationSheets = {
			playerAnimationSheet: await Texture.createTextureFromURL(
				device,
				"/assets/Prototype-character/AnimationSheet.png",
			),
		};
	}
}
