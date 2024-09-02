import { BufferUtil } from "./BufferUtil";
import { QuadGeometry } from "./StaticGeometry";
import { Texture } from "./Texture";
import CustomShaders from "./wgsl/shaders.wgsl";

/**
 * Creates a canvas instance onto the spefied `root` element and returns its webgpu context.
 * @param root HTMLElement | null
 * @returns GPUCanvasContext
 */
const initializeCanvas = (root: HTMLElement | null) => {
	const canvas = document.createElement("canvas");
	canvas.width = 800;
	canvas.height = 600;
	const context = canvas.getContext("webgpu");

	if (!root) throw Error("Root element not found, please specify it.");
	if (!context) throw Error("Could not get the rendering context from canvas.");
	root.appendChild(canvas);

	return context;
};

/**
 * Checks if the program can use the gpu, creates canvas context and configures it.
 * @returns [GPUCanvasContext, GPUDevice]
 */
const initializeDevice = async () => {
	if (!navigator.gpu) throw Error("Can not initialize gpu");

	const context = initializeCanvas(document.getElementById("root"));

	const adapter = await navigator.gpu.requestAdapter();
	if (!adapter) throw Error("Could not request adapter");

	const device = await adapter.requestDevice();
	if (!device) throw Error("Could not request device");

	const format = navigator.gpu.getPreferredCanvasFormat();

	context.configure({
		device: device,
		format: format,
	});

	return [context, device, format] as const;
};

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

/**
 * TODO: update description.
 * Creates a render pipeline
 * @param context GPUCanvasContext
 * @param device GPUDevice
//  */
const initializeModel = (
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

	return { renderPipeline, bindGroups: { resolutionBindGroup, textureBindGroup } };
};

/**
 * TODO
 */
const render = (
	device: GPUDevice,
	context: GPUCanvasContext,
	renderPipeline: GPURenderPipeline,
	bindGroups: {
		textureBindGroup: GPUBindGroup;
		resolutionBindGroup: GPUBindGroup;
	},
	buffers: {
		vertexBuffer: GPUBuffer;
		indexBuffer: GPUBuffer;
	},
) => {
	// update resolution ?

	const encoder = device.createCommandEncoder();

	const renderPass = encoder.beginRenderPass({
		colorAttachments: [
			{
				view: context.getCurrentTexture().createView(),
				loadOp: "clear",
				clearValue: { r: 0.85, g: 0.85, b: 0.85, a: 1 },
				storeOp: "store",
			},
		],
	});

	// DRAW HERE
	renderPass.setPipeline(renderPipeline);
	renderPass.setIndexBuffer(buffers.indexBuffer, "uint16");
	renderPass.setVertexBuffer(0, buffers.vertexBuffer);
	renderPass.setBindGroup(0, bindGroups.resolutionBindGroup);
	renderPass.setBindGroup(1, bindGroups.textureBindGroup);
	renderPass.drawIndexed(6);
	renderPass.end();
	device.queue.submit([encoder.finish()]);
};

/**
 * TODO
 * Clean up code (split into multiple components)
 */
const main = async () => {
	const [context, device, format] = await initializeDevice();

	const texture = await Texture.createTextureFromURL(device, "/src/assets/uv_test.png");

	const geometryData = new QuadGeometry();

	const resolutionBuffer = BufferUtil.createResolutionBuffer(
		device,
		new Float32Array([context.canvas.width, context.canvas.height]),
	);

	const { renderPipeline, bindGroups } = initializeModel(device, format, texture, resolutionBuffer);

	const vertexBuffer = BufferUtil.createVertexBuffer(device, new Float32Array(geometryData.vertices));
	const indexBuffer = BufferUtil.createIndexBuffer(device, new Uint16Array(geometryData.inidices));

	render(
		device,
		context,
		renderPipeline,
		{ resolutionBindGroup: bindGroups.resolutionBindGroup, textureBindGroup: bindGroups.textureBindGroup },
		{
			vertexBuffer,
			indexBuffer,
		},
	);
};

main();
