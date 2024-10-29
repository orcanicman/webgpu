import { BufferUtil } from "../../utils/BufferUtil";
import { getComponent } from "../../helpers/getComponent";
import { QuadGeometry } from "../../helpers/StaticGeometry";
import { Texture } from "../../utils/Texture";
import { System, Entity } from "../../types/ECS";
import { CameraFocusComponent } from "../entities/EntityComponents/CameraFocusComponent";
import { AnimationComponent } from "../entities/EntityComponents/AnimationComponent";
import { SpriteComponent } from "../entities/EntityComponents/SpriteComponent";
import { PositionComponent } from "../entities/EntityComponents/PositionComponent";
import { DimensionsComponent } from "../entities/EntityComponents/DimensionsComponent";
import { Vector2 } from "../../types/Vector2";
import { getPositionValues2d } from "../../utils/getDivisionWithRemainder";
import { TickSpeed } from "../../config/TickSpeed";
import { SpritePipeline } from "./RenderSystem/SpritePipeline";
import { Content } from "./RenderSystem/Content";
import { UV } from "../../types/UV";

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

	spritesProperties: {
		pipeline: SpritePipeline;
		entity: Entity;
		texture: Texture;
		buffers: { vertexBuffer: GPUBuffer; indexBuffer: GPUBuffer };
	}[] = [];

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
		for (const entity of entities) this.renderEntity(entity);

		renderPass.end();
		this.device.queue.submit([encoder.finish()]);
	};

	private renderEntity = (entity: Entity) => {
		const positionComponent = getComponent<PositionComponent>(entity, "position");
		const dimensionsComponent = getComponent<DimensionsComponent>(entity, "dimensions");
		const spriteComponent = getComponent<SpriteComponent>(entity, "sprite");
		const cameraFocusComponent = getComponent<CameraFocusComponent>(entity, "camera_focus");
		const animationComponent = getComponent<AnimationComponent>(entity, "animation");

		// Don't draw anything if entity does not have a position or dimensions.
		if (!positionComponent || !dimensionsComponent || !spriteComponent) return;

		// Update camera
		if (cameraFocusComponent) this.updateCameraToPosition(positionComponent);

		const textures: { UV: UV; texture: Texture }[] = [];

		if (animationComponent && animationComponent.currentAnimation) {
			const texture = Content["animationSheets"][animationComponent.animationSheet.name] as Texture;

			const animationFrameSet = animationComponent.currentAnimation;

			const { x, y } = getPositionValues2d(
				texture.width,
				animationFrameSet.width,
				animationComponent.currentFrame,
			);

			const u0 =
				(x + (animationComponent.facingDirection === "right" ? 0 : animationFrameSet.width)) / texture.width;
			const v0 = (y + 0.1) / texture.height;

			const u1 =
				(x + (animationComponent.facingDirection === "right" ? animationFrameSet.width : 0)) / texture.width;
			const v1 = (y + 0.1 + animationFrameSet.height) / texture.height;

			const UV: UV = {
				u: [u0, u1, u1, u0],
				v: [v1, v1, v0, v0],
			};

			textures.push({ texture, UV });
		}

		for (const textureSource of spriteComponent.textures) {
			const UV: UV = {
				u: [0, 1, 1, 0],
				v: [1, 1, 0, 0],
			};
			const texture = Content["textures"][textureSource.source] as Texture;
			textures.push({ texture, UV });
		}

		for (const texture of textures) {
			const geometryData = new QuadGeometry(
				positionComponent.position.x,
				positionComponent.position.y,
				dimensionsComponent.dimensions.width,
				dimensionsComponent.dimensions.height,
				texture.UV,
			);

			const { pipeline, buffers } = this.getSpriteProperties(entity, texture.texture, geometryData);

			this.drawSprite(pipeline, buffers, geometryData);
		}
	};

	private getSpriteProperties = (
		entity: Entity,
		texture: Texture,
		geometryData: QuadGeometry,
	): (typeof this.spritesProperties)[number] => {
		const spritePipeline = this.spritesProperties.find(
			(spritePipeline) => spritePipeline.entity === entity && spritePipeline.texture === texture,
		);

		if (spritePipeline) {
			this.device.queue.writeBuffer(
				spritePipeline.buffers.vertexBuffer,
				0,
				new Float32Array(geometryData.vertices),
			);
			this.device.queue.writeBuffer(
				spritePipeline.buffers.indexBuffer,
				0,
				new Uint16Array(geometryData.inidices),
			);
			return spritePipeline;
		}

		const vertexBuffer = BufferUtil.createVertexBuffer(this.device, new Float32Array(geometryData.vertices));
		const indexBuffer = BufferUtil.createIndexBuffer(this.device, new Uint16Array(geometryData.inidices));

		const newSpritePipeline = {
			pipeline: SpritePipeline.create(
				this.device,
				texture,
				this.buffers.resolutionBuffer,
				this.buffers.cameraBuffer,
			),
			entity: entity,
			buffers: {
				vertexBuffer,
				indexBuffer,
			},
			texture: texture,
		};
		this.spritesProperties.push(newSpritePipeline);
		return newSpritePipeline;
	};

	private drawSprite = (
		spritePipeline: SpritePipeline,
		buffers: { vertexBuffer: GPUBuffer; indexBuffer: GPUBuffer },
		geometryData: QuadGeometry,
	) => {
		this.renderPass.setPipeline(spritePipeline.pipeline);
		this.renderPass.setIndexBuffer(buffers.indexBuffer, "uint16");
		this.renderPass.setVertexBuffer(0, buffers.vertexBuffer);

		this.renderPass.setBindGroup(0, spritePipeline.resolutionBindGroup);
		this.renderPass.setBindGroup(1, spritePipeline.cameraBindGroup);
		this.renderPass.setBindGroup(2, spritePipeline.textureBindGroup);
		this.renderPass.drawIndexed(geometryData.inidices.length);
	};

	private updateCameraToPosition = (positionComponent: PositionComponent) => {
		const cameraTargetPosition = {
			x: positionComponent.position.x - this.context.canvas.width / 2,
			y: positionComponent.position.y - this.context.canvas.height / 2,
		};

		this.cameraPosition.x += (cameraTargetPosition.x - this.cameraPosition.x) * (12 / TickSpeed);
		this.cameraPosition.y += (cameraTargetPosition.y - this.cameraPosition.y) * (12 / TickSpeed);
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
