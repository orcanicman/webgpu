import { Texture } from "../../utils/Texture";
import CustomShaders from "../../wgsl/shaders.wgsl";

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

	private initialize(
		device: GPUDevice,
		texture: Texture,
		resolutionBuffer: GPUBuffer,
		cameraBuffer: GPUBuffer,
	): void {
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
							srcFactor: "src-alpha",
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
