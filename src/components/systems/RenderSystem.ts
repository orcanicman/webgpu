import { BufferUtil } from "../../BufferUtil";
import { getComponent } from "../../helpers/getComponent";
import { QuadGeometry } from "../../helpers/StaticGeometry";
import { Texture } from "../../Texture";
import { System, Entity } from "../../types/ECS";
import { PositionComponent, DimensionsComponent } from "../entities/EntityComponents";
import CustomShaders from "../../wgsl/shaders.wgsl";

export class RenderSystem implements System {
	device!: GPUDevice;
	format!: GPUTextureFormat;
	renderPipeline!: GPURenderPipeline;
	bindGroups!: {
		resolutionBindGroup: GPUBindGroup;
		textureBindGroup: GPUBindGroup;
	};

	buffers!: {
		vertexBuffer: GPUBuffer;
		indexBuffer: GPUBuffer;
	};

	constructor(private context: GPUCanvasContext) {}

	public initialize = async () => {
		await this.initializeDevice();

		const textures = await this.loadTextures();

		const resolutionBuffer = BufferUtil.createResolutionBuffer(
			this.device,
			new Float32Array([this.context.canvas.width, this.context.canvas.height]),
		);

		this.initializeModel(this.device, this.format, textures[0], resolutionBuffer);
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

		const tempBuffers: GPUBuffer[] = [];

		// DRAW HERE
		for (const entity of entities) {
			const positionComponent = getComponent<PositionComponent>(entity, "position");
			const dimensionsComponent = getComponent<DimensionsComponent>(entity, "dimensions");

			// Don't draw anything if entity does not have a position or dimensions.
			if (!positionComponent || !dimensionsComponent) continue;

			const geometryData = new QuadGeometry(
				positionComponent.position.x,
				positionComponent.position.y,
				dimensionsComponent.dimensions.width,
				dimensionsComponent.dimensions.height,
			);

			const vertexBuffer = BufferUtil.createVertexBuffer(this.device, new Float32Array(geometryData.vertices));
			const indexBuffer = BufferUtil.createIndexBuffer(this.device, new Uint16Array(geometryData.inidices));
			tempBuffers.push(vertexBuffer, indexBuffer);

			renderPass.setPipeline(this.renderPipeline);
			renderPass.setIndexBuffer(indexBuffer, "uint16");
			renderPass.setVertexBuffer(0, vertexBuffer);

			renderPass.setBindGroup(0, this.bindGroups.resolutionBindGroup);
			renderPass.setBindGroup(1, this.bindGroups.textureBindGroup);
			renderPass.drawIndexed(geometryData.inidices.length);
		}

		renderPass.end();
		this.device.queue.submit([encoder.finish()]);

		// destroy temp buffers. might be redundant
		for (const buffer of tempBuffers) {
			buffer.destroy();
		}
	};

	private loadTextures = async () => {
		const uvTestTexture = await Texture.createTextureFromURL(this.device, "/src/assets/uv_test.png");
		return [uvTestTexture];
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

		this.device = device;
		this.format = format;
	};

	/**
	 * TODO: update description.
	 * Creates a render pipeline
	 * @param context GPUCanvasContext
	 * @param device GPUDevice
	 */
	private initializeModel = (
		device: GPUDevice,
		format: GPUTextureFormat,
		texture: Texture,
		resolutionBuffer: GPUBuffer,
	) => {
		const { vertexBufferLayout } = initializeBufferLayouts();

		const shaderModule = device.createShaderModule({
			code: CustomShaders.code,
			label: "Shaders.wgsl",
		});

		const { vertexState, fragmentState } = initializeShaderStates(shaderModule, format, [vertexBufferLayout]);

		const { textureBindGroupLayout, pipelineLayout, resolutionBindGroupLayout } = initializeLayouts(device);

		const { renderPipeline, resolutionBindGroup, textureBindGroup } = createBindGroupAndPipeline(
			device,
			{ pipelineLayout, textureBindGroupLayout, resolutionBindGroupLayout },
			{ fragmentState, vertexState },
			{ resolutionBuffer },
			texture,
		);

		this.bindGroups = { resolutionBindGroup, textureBindGroup };
		this.renderPipeline = renderPipeline;
	};
}

const initializeBufferLayouts = () => {
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

const initializeShaderStates = (
	shaderModule: GPUShaderModule,
	format: GPUTextureFormat,
	buffers: GPUVertexBufferLayout[],
) => {
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
				format,
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

const initializeLayouts = (device: GPUDevice) => {
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
		bindGroupLayouts: [resolutionBindGroupLayout, textureBindGroupLayout],
	});

	return { textureBindGroupLayout, pipelineLayout, resolutionBindGroupLayout };
};

const createBindGroupAndPipeline = (
	device: GPUDevice,
	layouts: {
		textureBindGroupLayout: GPUBindGroupLayout;
		resolutionBindGroupLayout: GPUBindGroupLayout;
		pipelineLayout: GPUPipelineLayout;
	},
	states: {
		vertexState: GPUVertexState;
		fragmentState: GPUFragmentState;
	},
	buffers: {
		resolutionBuffer: GPUBuffer;
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

	return { resolutionBindGroup, textureBindGroup, renderPipeline };
};
