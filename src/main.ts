import { createRectFromBoundingBox } from "./utils/createRectFromBoundingBox";
import CustomShaders from "./wgsl/shaders.wgsl";

/**
 * Creates a canvas instance onto the spefied `root` element and returns its webgpu context.
 * @param root HTMLElement | null
 * @returns GPUCanvasContext
 */
const initializeCanvas = (root: HTMLElement | null) => {
  const canvas = document.createElement("canvas");
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

/**
 * TODO: update description.
 * Creates a render pipeline
 * @param context GPUCanvasContext
 * @param device GPUDevice
//  */
const initializePipeline = (
  context: GPUCanvasContext,
  device: GPUDevice,
  format: GPUTextureFormat
) => {
  /**
   * Shapes what each vertex will look like.
   */
  const vertexBufferLayout: GPUVertexBufferLayout = {
    arrayStride: 8, // how many bytes per step/stage
    /*
     * pretty sure this should be defined by attributes[number].format. Lets say the format is float32x2:
     * float32 is 32 bits or 4 bytes. since im doing it * 2 that's an arrayStride of 8.
     */
    attributes: [
      // Can be many more attributes
      {
        format: "float32x2", // I think i use this since im only using X and Y so does that mean i use 2 float 32's?
        offset: 0, // If i want to add more attributes, i need to say where the data begins with offset.
        shaderLocation: 0, // Binds to @location(number) in the shader code.
      },
    ],
  };

  const shaderModule = device.createShaderModule({
    code: CustomShaders.code, // The code that will enhibit the shaderModule. Can be both fragmentshaders and vertexshaders.
    label: "Shaders.wgsl", // just something to identify the object.
  });

  const renderPipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shaderModule, // What shader module to look in?
      entryPoint: "vertex_main", // this is the function in the shader code that it references.
      buffers: [vertexBufferLayout], // defines the layout of the vertex attribute data
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragment_main",
      targets: [
        { format }, // The textureformat that the fragmentshader compiles to?
      ],
    },
  });

  return [renderPipeline] as const;
};

/**
 * TODO
 */
const render = (
  device: GPUDevice,
  context: GPUCanvasContext,
  renderPipeline: GPURenderPipeline
) => {
  const encoder = device.createCommandEncoder();

  const renderPass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1 },
        storeOp: "store",
      },
    ],
  });

  const vertexBufferArray = createRectFromBoundingBox({
    x: 0,
    y: 0,
    width: 0.8,
    height: 0.8,
  });

  // write stuff to the vertex shader?
  const vertexBuffer = device.createBuffer({
    label: "vertecies",
    size: vertexBufferArray.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertexBufferArray);

  renderPass.setPipeline(renderPipeline);
  renderPass.setVertexBuffer(0, vertexBuffer);

  renderPass.draw(vertexBufferArray.length / 2);

  renderPass.end();
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
};

/**
 * TODO
 * 1. ✅ Create vertexBufferLayout
 * 2. ✅ Load in the shadermodule
 * 3. ✅ Create a render pipeline with the loaded shadermodule (add vertexBufferLayout to the vertex.)
 * 4. ✅ Make a buffer with the byteLength of my desired GRID (can be screen width * screen height.)
 * 5. 🔳 TODO: Add textures ✨✨
 * 6. ✅ Make a bindGroup
 *
 * 7. ✅ Render
 */
const main = async () => {
  const [context, device, format] = await initializeDevice();

  const [renderPipeline] = initializePipeline(context, device, format);

  render(device, context, renderPipeline);
};

main();
