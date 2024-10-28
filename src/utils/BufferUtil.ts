export class BufferUtil {
	/**
	 * Memory leak
	 */
	public static createVertexBuffer(device: GPUDevice, data: Float32Array): GPUBuffer {
		// console.log("Create vertex buffer");
		const buffer = device.createBuffer({
			size: data.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		new Float32Array(buffer.getMappedRange()).set(data);
		buffer.unmap();

		return buffer;
	}

	public static createResolutionBuffer(device: GPUDevice, data: Float32Array): GPUBuffer {
		const buffer = device.createBuffer({
			size: data.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		new Float32Array(buffer.getMappedRange()).set(data);
		buffer.unmap();

		return buffer;
	}

	public static createCameraBuffer(device: GPUDevice, data: Float32Array): GPUBuffer {
		const buffer = device.createBuffer({
			size: data.byteLength,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		new Float32Array(buffer.getMappedRange()).set(data);
		buffer.unmap();

		return buffer;
	}

	/**
	 * Memory leak
	 */
	public static createIndexBuffer(device: GPUDevice, data: Uint16Array): GPUBuffer {
		const buffer = device.createBuffer({
			size: data.byteLength,
			usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
			mappedAtCreation: true,
		});

		new Uint16Array(buffer.getMappedRange()).set(data);
		buffer.unmap();

		return buffer;
	}
}
