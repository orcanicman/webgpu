struct VertexInput {
    @location(0) position: vec2f, // OKAY SO, at the start of the program, the position is expected to be given to the vertex buffer which is at @location(0).
}

struct VertexOutput {
    @builtin(position) position: vec4f, // After we are done with the input, we set the position to builtin
    @location(0) color: vec4f, // And we set the color to @location(0) since that is what the function needs to return.
}

@vertex
fn vertex_main(vert: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.color = vec4f(1, 0, 0, 1);
    output.position = vec4f(vert.position, 0.0, 1.0);

    return output;
}

@fragment
fn fragment_main(vert: VertexOutput) -> @location(0) vec4f {
    return vert.color;
}
