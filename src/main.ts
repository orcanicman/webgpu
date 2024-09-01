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
	const textureBindGroupLayout = device.createBindGroupLayout({
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
		bindGroupLayouts: [textureBindGroupLayout],
	});

	return { textureBindGroupLayout, pipelineLayout };
};

const createBindGroupAndPipeline = (
	device: GPUDevice,
	layouts: {
		textureBindGroupLayout: GPUBindGroupLayout;
		pipelineLayout: GPUPipelineLayout;
	},
	states: {
		vertexState: GPUVertexState;
		fragmentState: GPUFragmentState;
	},
	texture: Texture,
) => {
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

	return { textureBindGroup, renderPipeline };
};

/**
 * TODO: update description.
 * Creates a render pipeline
 * @param context GPUCanvasContext
 * @param device GPUDevice
//  */
const initializeModel = (device: GPUDevice, format: GPUTextureFormat, texture: Texture) => {
	const { vertexBufferLayout } = initializeBufferLayouts();

	const shaderModule = device.createShaderModule({
		code: CustomShaders.code,
		label: "Shaders.wgsl",
	});

	const { vertexState, fragmentState } = initializeShaderStates(shaderModule, format, [vertexBufferLayout]);

	const { textureBindGroupLayout, pipelineLayout } = initializeLayouts(device);

	const { renderPipeline, textureBindGroup } = createBindGroupAndPipeline(
		device,
		{ pipelineLayout, textureBindGroupLayout },
		{ fragmentState, vertexState },
		texture,
	);

	return { renderPipeline, textureBindGroup };
};

/**
 * TODO
 */
const render = (
	device: GPUDevice,
	context: GPUCanvasContext,
	renderPipeline: GPURenderPipeline,
	textureBindGroup: GPUBindGroup,
	buffers: {
		vertexBuffer: GPUBuffer;
		indexBuffer: GPUBuffer;
	},
) => {
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
	renderPass.setBindGroup(0, textureBindGroup);
	renderPass.drawIndexed(6);
	renderPass.end();
	device.queue.submit([encoder.finish()]);
};

/**
 * TODO
 * 1. ✅ Create vertexBufferLayout
 * 2. ✅ Load in the shadermodule
 * 3. ✅ Create a render pipeline with the loaded shadermodule (add vertexBufferLayout to the vertex.)
 * 4. ✅ Make a buffer with the byteLength of my desired GRID (can be screen width * screen height.)
 * 5. ✅ TODO: Add textures ✨✨
 * 6. ✅ Make a bindGroup
 *
 * 7. ✅ Render
 */
const main = async () => {
	const [context, device, format] = await initializeDevice();

	const texture = await Texture.createTextureFromURL(device, "/src/assets/uv_test.png");

	const geometryData = new QuadGeometry();

	const { renderPipeline, textureBindGroup } = initializeModel(device, format, texture);

	const vertexBuffer = BufferUtil.createVertexBuffer(device, new Float32Array(geometryData.vertices));
	const indexBuffer = BufferUtil.createIndexBuffer(device, new Uint16Array(geometryData.inidices));

	render(device, context, renderPipeline, textureBindGroup, {
		vertexBuffer,
		indexBuffer,
	});
};

main();
