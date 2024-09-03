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
@group(1) @binding(0) var<uniform> camera_position: vec2f;


fn to_clip_space(position: vec2f) -> vec2<f32> {
    // Add camera
    let converted_position = position - camera_position;

    // convert the position from pixels to a 0.0 to 1.0 value
    let zero_to_one = converted_position / resolution;
    // let zero_to_one = position / resolution;

    // convert from 0 <-> 1 to 0 <-> 2
    let zero_to_two = zero_to_one * 2.0;

    // covert from 0 <-> 2 to -1 <-> +1 (clip space)
    let clip_space = zero_to_two - 1.0;

    // results into x,y=0 is at the bottom left.
    return clip_space;
}

@vertex
fn vertex_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    output.position = vec4f(to_clip_space(input.position), 0.0, 1.0);
    output.color = vec4f(input.color, 1.0);
    output.tex_coords = input.tex_coords;

    return output;
}

@group(2) @binding(0) var tex_sampler: sampler;
@group(2) @binding(1) var tex: texture_2d<f32>;

@fragment
fn fragment_main(input: VertexOutput) -> @location(0) vec4f {
    var texture_color = textureSample(tex, tex_sampler, input.tex_coords);
    return input.color * texture_color;
}
