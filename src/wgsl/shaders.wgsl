struct VertexInput {
    @location(0) position: vec2f,
    @location(1) tex_coords: vec2f,
    @location(2) color: vec3f,
}

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) tex_coords: vec2f,
    @location(1) color: vec4f,
}

@vertex
fn vertex_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    output.position = vec4f(input.position, 0.0, 1.0);
    output.color = vec4f(input.color, 1.0);
    output.tex_coords = input.tex_coords;

    return output;
}

@group(0) @binding(0) var tex_sampler: sampler;
@group(0) @binding(1) var tex: texture_2d<f32>;

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
    var texture_color = textureSample(tex, tex_sampler, input.tex_coords);
    return input.color * texture_color;
}
