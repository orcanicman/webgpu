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

@group(0) @binding(0) var<uniform> resolution: vec2f;


fn to_clip_space(position: vec2f) -> vec2<f32> {
    // convert the position from pixels to a 0.0 to 1.0 value
    let zeroToOne = position / resolution;

    // convert from 0 <-> 1 to 0 <-> 2
    let zeroToTwo = zeroToOne * 2.0;

    // covert from 0 <-> 2 to -1 <-> +1 (clip space)
    let clipSpace = zeroToTwo - 1.0;

    // results into x,y=0 is at the bottom left.

    return clipSpace;
}

@vertex
fn vertex_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    output.position = vec4f(to_clip_space(input.position), 0.0, 1.0);
    output.color = vec4f(input.color, 1.0);
    output.tex_coords = input.tex_coords;

    return output;
}

@group(1) @binding(0) var tex_sampler: sampler;
@group(1) @binding(1) var tex: texture_2d<f32>;

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
    var texture_color = textureSample(tex, tex_sampler, input.tex_coords);
    return input.color * texture_color;
}
