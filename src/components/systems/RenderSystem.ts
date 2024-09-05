import { BufferUtil } from "../../BufferUtil";
import { getComponent } from "../../helpers/getComponent";
import { QuadGeometry } from "../../helpers/StaticGeometry";
import { Texture } from "../../Texture";
import { System, Entity } from "../../types/ECS";
import {
	PositionComponent,
	DimensionsComponent,
	SpriteComponent,
	CameraFocusComponent,
} from "../entities/EntityComponents";
import CustomShaders from "../../wgsl/shaders.wgsl";
import { BoundingBox } from "../../types/BoundingBox";
import { Vector2 } from "../../types/Vector2";

export class RenderSystem implements System {
	device!: GPUDevice;

	renderPipeline!: GPURenderPipeline;

	renderPass!: GPURenderPassEncoder;

	// todo: remove/refactor
	cameraPosition!: Vector2;

	constructor(private context: GPUCanvasContext) {}

	public initialize = async () => {
		const { device } = await this.initializeDevice();

		await Content.initialize(device);

		this.cameraPosition = { x: 0, y: 0 };

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

		// DRAW HERE
		for (const entity of entities) {
			const positionComponent = getComponent<PositionComponent>(entity, "position");
			const dimensionsComponent = getComponent<DimensionsComponent>(entity, "dimensions");
			const spriteComponent = getComponent<SpriteComponent>(entity, "sprite");
			const cameraFocusComponent = getComponent<CameraFocusComponent>(entity, "camera_focus");

			// Don't draw anything if entity does not have a position or dimensions.
			if (!positionComponent || !dimensionsComponent || !spriteComponent) continue;

			if (cameraFocusComponent) {
				const cameraTargetPosition = {
					x: positionComponent.position.x - this.context.canvas.width / 2,
					y: positionComponent.position.y - this.context.canvas.height / 2,
				};

				this.cameraPosition.x += (cameraTargetPosition.x - this.cameraPosition.x) * 0.05;
				this.cameraPosition.y += (cameraTargetPosition.y - this.cameraPosition.y) * 0.05;
			}

			const resolutionBuffer = BufferUtil.createResolutionBuffer(
				this.device,
				new Float32Array([this.context.canvas.width, this.context.canvas.height]),
			);

			// TODO: To be removed/updated/refactored idc should probably be an entity...
			const cameraBuffer = BufferUtil.createCameraBuffer(
				this.device,
				new Float32Array([this.cameraPosition.x, this.cameraPosition.y]),
			);

			this.drawSprite(
				Content[spriteComponent.source] as Texture,
				{
					...positionComponent.position,
					...dimensionsComponent.dimensions,
				},
				resolutionBuffer,
				cameraBuffer,
			);
		}

		renderPass.end();
		this.device.queue.submit([encoder.finish()]);
	};

	public drawSprite = (
		texture: Texture,
		boundingBox: BoundingBox,
		resolutionBuffer: GPUBuffer,
		cameraBuffer: GPUBuffer,
	) => {
		const spritePipepline = SpritePipeline.create(this.device, texture, resolutionBuffer, cameraBuffer);

		const geometryData = new QuadGeometry(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);

		const vertexBuffer = BufferUtil.createVertexBuffer(this.device, new Float32Array(geometryData.vertices));
		const indexBuffer = BufferUtil.createIndexBuffer(this.device, new Uint16Array(geometryData.inidices));

		this.renderPass.setPipeline(spritePipepline.pipeline);
		this.renderPass.setIndexBuffer(indexBuffer, "uint16");
		this.renderPass.setVertexBuffer(0, vertexBuffer);

		this.renderPass.setBindGroup(0, spritePipepline.resolutionBindGroup);
		this.renderPass.setBindGroup(1, spritePipepline.cameraBindGroup);
		this.renderPass.setBindGroup(2, spritePipepline.textureBindGroup);
		this.renderPass.drawIndexed(geometryData.inidices.length);
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
	public static uvTestTexture: Texture;
	public static playerTexture: Texture;
	public static redTexture: Texture;
	public static redHitbox: Texture;
	public static playerAnimationSheet: Texture;

	public static async initialize(device: GPUDevice) {
		this.playerTexture = await Texture.createTextureFromURL(device, "/src/assets/penis.png");
		this.redHitbox = await Texture.createTextureFromURL(device, "/src/assets/red_hitbox.png");
		this.redTexture = await Texture.createTextureFromURL(device, "/src/assets/red_16x32.png");
		this.uvTestTexture = await Texture.createTextureFromURL(device, "/src/assets/uv_test.png");
		this.playerAnimationSheet = await Texture.createTextureFromURL(
			device,
			"/src/assets/Prototype-character/AnimationSheet.png",
		);
	}
}

export class SpritePipeline {
	public pipeline!: GPURenderPipeline;
	public textureBindGroup!: GPUBindGroup;
	public resolutionBindGroup!: GPUBindGroup;
	public cameraBindGroup!: GPUBindGroup;

	public static create(
		device: GPUDevice,
		texture: Texture,
		resolutionBuffer: GPUBuffer,
		cameraBuffer: GPUBuffer,
	): SpritePipeline {
		const pipeline = new SpritePipeline();
		pipeline.initialize(device, texture, resolutionBuffer, cameraBuffer);
		return pipeline;
	}

	public initialize(device: GPUDevice, texture: Texture, resolutionBuffer: GPUBuffer, cameraBuffer: GPUBuffer): void {
		const shaderModule = device.createShaderModule({
			code: CustomShaders.code,
			label: "Shaders.wgsl",
		});

		const { vertexBufferLayout } = this.initializeBufferLayouts();

		const { vertexState, fragmentState } = this.initializeShaderStates(shaderModule, [vertexBufferLayout]);

		const { textureBindGroupLayout, pipelineLayout, resolutionBindGroupLayout, cameraBindGroupLayout } =
			this.initializeLayouts(device);

		const { renderPipeline, resolutionBindGroup, textureBindGroup, cameraBindGroup } =
			this.createBindGroupAndPipeline(
				device,
				{ pipelineLayout, textureBindGroupLayout, resolutionBindGroupLayout, cameraBindGroupLayout },
				{ fragmentState, vertexState },
				{ resolutionBuffer, cameraBuffer },
				texture,
			);

		this.resolutionBindGroup = resolutionBindGroup;
		this.cameraBindGroup = cameraBindGroup;
		this.textureBindGroup = textureBindGroup;
		this.pipeline = renderPipeline;
	}

	private initializeBufferLayouts = () => {
		const vertexBufferLayout: GPUVertexBufferLayout = {
			arrayStride: Float32Array.BYTES_PER_ELEMENT * 7, // X, Y, U, V, R, G, B
			attributes: [
				{
					// X, Y
					shaderLocation: 0,
					format: "float32x2",
					offset: 0,
				},
				{
					// U, V
					shaderLocation: 1,
					format: "float32x2",
					offset: 2 * Float32Array.BYTES_PER_ELEMENT, // previous attribute is 2 bytes, so offset is 2.
				},
				{
					// R, G, B
					shaderLocation: 2,
					format: "float32x3",
					offset: 4 * Float32Array.BYTES_PER_ELEMENT, // previous attribute is 2 bytes, and before that also 2. so offset is 4.
				},
			],
			stepMode: "vertex",
		};

		return { vertexBufferLayout };
	};

	private initializeShaderStates = (shaderModule: GPUShaderModule, buffers: GPUVertexBufferLayout[]) => {
		const vertexState: GPUVertexState = {
			module: shaderModule, // What shader module to look in?
			entryPoint: "vertex_main", // this is the function in the shader code that it references.
			buffers, // defines the layout of the vertex attribute data
		};

		const fragmentState: GPUFragmentState = {
			module: shaderModule,
			entryPoint: "fragment_main",
			targets: [
				{
					format: navigator.gpu.getPreferredCanvasFormat(),
					blend: {
						color: {
							srcFactor: "one",
							dstFactor: "one-minus-src-alpha",
							operation: "add",
						},
						alpha: {
							srcFactor: "one",
							dstFactor: "one-minus-src-alpha",
							operation: "add",
						},
					},
				},
			],
		};

		return { vertexState, fragmentState };
	};

	private initializeLayouts = (device: GPUDevice) => {
		const resolutionBindGroupLayout = device.createBindGroupLayout({
			label: "ResolutionBindGroupLayout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {},
				},
			],
		});

		const cameraBindGroupLayout = device.createBindGroupLayout({
			label: "ResolutionBindGroupLayout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX,
					buffer: {},
				},
			],
		});

		const textureBindGroupLayout = device.createBindGroupLayout({
			label: "TextureBindGroupLayout",
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.FRAGMENT,
					sampler: {},
				},
				{
					binding: 1,
					visibility: GPUShaderStage.FRAGMENT,
					texture: {},
				},
			],
		});

		const pipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [resolutionBindGroupLayout, cameraBindGroupLayout, textureBindGroupLayout],
		});

		return { textureBindGroupLayout, pipelineLayout, resolutionBindGroupLayout, cameraBindGroupLayout };
	};

	private createBindGroupAndPipeline = (
		device: GPUDevice,
		layouts: {
			textureBindGroupLayout: GPUBindGroupLayout;
			resolutionBindGroupLayout: GPUBindGroupLayout;
			cameraBindGroupLayout: GPUBindGroupLayout;
			pipelineLayout: GPUPipelineLayout;
		},
		states: {
			vertexState: GPUVertexState;
			fragmentState: GPUFragmentState;
		},
		buffers: {
			resolutionBuffer: GPUBuffer;
			cameraBuffer: GPUBuffer;
		},
		texture: Texture,
	) => {
		const resolutionBindGroup = device.createBindGroup({
			layout: layouts.resolutionBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: { buffer: buffers.resolutionBuffer },
				},
			],
		});

		const cameraBindGroup = device.createBindGroup({
			layout: layouts.cameraBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: { buffer: buffers.cameraBuffer },
				},
			],
		});

		const textureBindGroup = device.createBindGroup({
			layout: layouts.textureBindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: texture.sampler,
				},
				{
					binding: 1,
					resource: texture.texture.createView(),
				},
			],
		});

		const renderPipeline = device.createRenderPipeline({
			layout: layouts.pipelineLayout,
			vertex: states.vertexState,
			fragment: states.fragmentState,
			primitive: {
				topology: "triangle-list",
			},
		});

		return { resolutionBindGroup, cameraBindGroup, textureBindGroup, renderPipeline };
	};
}
