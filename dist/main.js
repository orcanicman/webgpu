(()=>{"use strict";const e=(e,t)=>e.components.find((e=>e.type===t)),t=(e,t)=>{const{x:i,y:o,height:n,width:r}=e,{x:s,y:a,height:c,width:u}=t;return i+r>s&&s+u>i&&o+n>a&&a+c>o};class i{initialize=async()=>{console.log("Collision system initialized.")};update=(i,n)=>{const r=[];for(const i of n){const n=e(i,"collider"),s=e(i,"position"),a=e(i,"dimensions"),c=e(i,"velocity");if(!n||!s||!a)continue;const u={...s.previousPosition,...a.dimensions},l={...s.position,...a.dimensions};if("dynamic"!==n.colliderType){r.push({boundingBox:l,entity:i,colliderComponent:n});continue}const d=r.filter((e=>t(e.boundingBox,l)));if(c)for(const e of d){const t=o(l),i=o(u),n=o(e.boundingBox);"rigid"!==e.colliderComponent.colliderType?e.colliderComponent.colliderType:(0!==c.velocity.x&&(t.right>=n.left&&i.right<=n.left&&(s.position.x=n.left-l.width,c.velocity.x=0),t.left<=n.right&&i.left>=n.right&&(s.position.x=n.right,c.velocity.x=0)),0!==c.velocity.y&&(t.bottom>=n.top&&i.bottom<=n.top&&(s.position.y=n.top-l.height,c.velocity.y=0),t.top<=n.bottom&&i.top>=n.bottom&&(s.position.y=n.bottom,c.velocity.y=0)))}}}}const o=e=>({right:e.x+e.width,left:e.x,top:e.y,bottom:e.y+e.height});class n{colliderType;type="collider";isColliding=!1;constructor(e){this.colliderType=e}}class r{speed;type="controllable";constructor(e){this.speed=e}}class s{dimensions;type="dimensions";constructor(e){this.dimensions=e}}class a{mass;type="gravity";constructor(e){this.mass=e}}class c{position;previousPosition;type="position";constructor(e,t={x:e.x.valueOf(),y:e.y.valueOf()}){this.position=e,this.previousPosition=t}}class u{source;type="sprite";constructor(e){this.source=e}}class l{velocity;maxVelocity;type="velocity";constructor(e,t={x:1/0,y:1/0}){this.velocity=e,this.maxVelocity=t}}class d{id;components;constructor(e,t){this.id=e,this.components=t}}class p{context;previousTimestamp=0;accumulatedTime=0;animationFrameId=null;canvas;constructor(e){this.context=e,this.canvas=e.canvas}initialize=async e=>{this.initializeCanvas(),this.initializeLoop(e),this.resizeCanvasToDisplaySize()};initializeCanvas=()=>{this.canvas.style.display="block",this.canvas.style.width="100vw",this.canvas.style.height="100vh"};initializeLoop=e=>{const t=()=>{this.animationFrameId||(this.previousTimestamp=performance.now(),window.requestAnimationFrame(e))};window.addEventListener("focus",t),window.addEventListener("blur",(()=>{this.animationFrameId&&(window.cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null)})),t()};resizeCanvasToDisplaySize=()=>{const e=this.canvas,t=e.clientWidth,i=e.clientHeight,o=e.width!==t||e.height!==i;return o&&(e.width=t,e.height=i),o}}class h{context;entities;systems;windowManager;constructor(e,t=[],i=[]){this.context=e,this.entities=t,this.systems=i}initialize=async()=>{for(const e of this.systems)await e.initialize();const e=new p(this.context);this.windowManager=e,e.initialize(this.loop)};loop=e=>{const t=1e3/240,i=e-this.windowManager.previousTimestamp;for(this.windowManager.previousTimestamp=e,this.windowManager.accumulatedTime+=i;this.windowManager.accumulatedTime>=t;)this.update(t),this.windowManager.accumulatedTime-=t;this.windowManager.animationFrameId=window.requestAnimationFrame(this.loop)};update=e=>{this.windowManager.resizeCanvasToDisplaySize();for(const t of this.systems)t.update(e,this.entities)}}class y{initialize=async()=>{console.log("Gravity system initialized.")};update=(t,i)=>{for(const o of i){const i=e(o,"gravity"),n=e(o,"velocity");i&&n&&(n.velocity.y-=9.8*i.mass*(t/1e3))}}}class m{window;constructor(e){this.window=e,this.init()}initialize=async()=>{console.log("Movement system initialized.")};keyboardState={a:!1,w:!1,s:!1,d:!1," ":!1};movementKeys=["a","w","s","d"," "];handleKeyDown=e=>{const t=e.key;this.movementKeys.includes(t)&&this.setMovementKeyState(t,!0)};handleKeyUp=e=>{const t=e.key;this.movementKeys.includes(t)&&this.setMovementKeyState(t,!1)};setMovementKeyState(e,t){this.keyboardState[e]=t}init=()=>{this.window.addEventListener("keydown",this.handleKeyDown),this.window.addEventListener("keyup",this.handleKeyUp)};update=(t,i)=>{for(const o of i){const i=e(o,"controllable"),n=e(o,"velocity"),r=e(o,"position");if(!i||!r||!n)continue;const s=i.speed*(t/1e3);this.updatePlayerVelocity(s,n),this.handleBraking(s,n),r.previousPosition.x=r.position.x.valueOf(),r.previousPosition.y=r.position.y.valueOf(),r.position.x+=n.velocity.x*(t/1e3),r.position.y+=n.velocity.y*(t/1e3)}};updatePlayerVelocity(e,t){this.keyboardState.a&&(t.velocity.x-=e,this.limitVelocity("x",t)),this.keyboardState.d&&(t.velocity.x+=e,this.limitVelocity("x",t)),this.keyboardState[" "]&&this.jump(t)}handleBraking(e,t){t.velocity.x>0&&!this.keyboardState.d&&(t.velocity.x-=3.5*e,t.velocity.x<0&&(t.velocity.x=0)),t.velocity.x<0&&!this.keyboardState.a&&(t.velocity.x+=3.5*e,t.velocity.x>0&&(t.velocity.x=0))}limitVelocity(e,t){const i=t.velocity[e],o=t.maxVelocity[e];i>o?t.velocity[e]=o:i<-o&&(t.velocity[e]=-o)}jump(e){e.velocity.y=150}}class f{static createVertexBuffer(e,t){const i=e.createBuffer({size:t.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Float32Array(i.getMappedRange()).set(t),i.unmap(),i}static createResolutionBuffer(e,t){const i=e.createBuffer({size:t.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Float32Array(i.getMappedRange()).set(t),i.unmap(),i}static createIndexBuffer(e,t){const i=e.createBuffer({size:t.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Uint16Array(i.getMappedRange()).set(t),i.unmap(),i}}class v{vertices;inidices;constructor(e,t,i,o){this.vertices=[e,t,0,1,1,1,1,e+i,t,1,1,1,1,1,e+i,t+o,1,0,1,1,1,e,t+o,0,0,1,1,1],this.inidices=[0,1,2,0,3,2]}}class x{texture;sampler;constructor(e,t){this.texture=e,this.sampler=t}static async createTexture(e,t){const i=e.createTexture({size:{width:t.width,height:t.height},format:"rgba8unorm",usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT}),o=await createImageBitmap(t);e.queue.copyExternalImageToTexture({source:o},{texture:i},{width:t.width,height:t.height});const n=e.createSampler({magFilter:"nearest",minFilter:"linear"});return new x(i,n)}static async createTextureFromURL(e,t){const i=new Promise(((e,i)=>{const o=new Image;o.src=t,o.onload=()=>e(o),o.onerror=()=>{console.error(`Failed to load image ${t}`),i()}})),o=await i;return x.createTexture(e,o)}}class g{context;device;renderPipeline;renderPass;constructor(e){this.context=e}initialize=async()=>{const{device:e}=await this.initializeDevice();await w.initialize(e),this.device=e};update=(t,i)=>{const o=this.device.createCommandEncoder(),n=o.beginRenderPass({colorAttachments:[{view:this.context.getCurrentTexture().createView(),loadOp:"clear",clearValue:{r:.85,g:.85,b:.85,a:1},storeOp:"store"}]});this.renderPass=n;for(const t of i){const i=e(t,"position"),o=e(t,"dimensions"),n=e(t,"sprite");if(!i||!o||!n)continue;const r=f.createResolutionBuffer(this.device,new Float32Array([this.context.canvas.width,this.context.canvas.height]));this.drawSprite(w[n.source],{...i.position,...o.dimensions},r)}n.end(),this.device.queue.submit([o.finish()])};drawSprite=(e,t,i)=>{const o=T.create(this.device,e,i),n=new v(t.x,t.y,t.width,t.height),r=f.createVertexBuffer(this.device,new Float32Array(n.vertices)),s=f.createIndexBuffer(this.device,new Uint16Array(n.inidices));this.renderPass.setPipeline(o.pipeline),this.renderPass.setIndexBuffer(s,"uint16"),this.renderPass.setVertexBuffer(0,r),this.renderPass.setBindGroup(0,o.resolutionBindGroup),this.renderPass.setBindGroup(1,o.textureBindGroup),this.renderPass.drawIndexed(n.inidices.length)};initializeDevice=async()=>{if(!navigator.gpu)throw Error("Can not initialize gpu");const e=await navigator.gpu.requestAdapter();if(!e)throw Error("Could not request adapter");const t=await e.requestDevice();if(!t)throw Error("Could not request device");const i=navigator.gpu.getPreferredCanvasFormat();return this.context.configure({device:t,format:i}),{device:t}}}class w{static uvTestTexture;static playerTexture;static async initialize(e){this.playerTexture=await x.createTextureFromURL(e,"/src/assets/penis.png"),this.uvTestTexture=await x.createTextureFromURL(e,"/src/assets/uv_test.png")}}class T{pipeline;textureBindGroup;resolutionBindGroup;static create(e,t,i){const o=new T;return o.initialize(e,t,i),o}initialize(e,t,i){const o=e.createShaderModule({code:"struct VertexInput {\r\n    @location(0) position: vec2f,\r\n    @location(1) tex_coords: vec2f,\r\n    @location(2) color: vec3f,\r\n}\r\n\r\nstruct VertexOutput {\r\n    @builtin(position) position: vec4f,\r\n    @location(0) tex_coords: vec2f,\r\n    @location(1) color: vec4f,\r\n}\r\n\r\n@group(0) @binding(0) var<uniform> resolution: vec2f;\r\n\r\n\r\nfn to_clip_space(position: vec2f) -> vec2<f32> {\r\n    // convert the position from pixels to a 0.0 to 1.0 value\r\n    let zeroToOne = position / resolution;\r\n\r\n    // convert from 0 <-> 1 to 0 <-> 2\r\n    let zeroToTwo = zeroToOne * 2.0;\r\n\r\n    // covert from 0 <-> 2 to -1 <-> +1 (clip space)\r\n    let clipSpace = zeroToTwo - 1.0;\r\n\r\n    // results into x,y=0 is at the bottom left.\r\n\r\n    return clipSpace;\r\n}\r\n\r\n@vertex\r\nfn vertex_main(input: VertexInput) -> VertexOutput {\r\n    var output: VertexOutput;\r\n\r\n    output.position = vec4f(to_clip_space(input.position), 0.0, 1.0);\r\n    output.color = vec4f(input.color, 1.0);\r\n    output.tex_coords = input.tex_coords;\r\n\r\n    return output;\r\n}\r\n\r\n@group(1) @binding(0) var tex_sampler: sampler;\r\n@group(1) @binding(1) var tex: texture_2d<f32>;\r\n\r\n@fragment\r\nfn fragment_main(input: VertexOutput) -> @location(0) vec4f {\r\n    var texture_color = textureSample(tex, tex_sampler, input.tex_coords);\r\n    return input.color * texture_color;\r\n}\r\n",label:"Shaders.wgsl"}),{vertexBufferLayout:n}=this.initializeBufferLayouts(),{vertexState:r,fragmentState:s}=this.initializeShaderStates(o,[n]),{textureBindGroupLayout:a,pipelineLayout:c,resolutionBindGroupLayout:u}=this.initializeLayouts(e),{renderPipeline:l,resolutionBindGroup:d,textureBindGroup:p}=this.createBindGroupAndPipeline(e,{pipelineLayout:c,textureBindGroupLayout:a,resolutionBindGroupLayout:u},{fragmentState:s,vertexState:r},{resolutionBuffer:i},t);this.resolutionBindGroup=d,this.textureBindGroup=p,this.pipeline=l}initializeBufferLayouts=()=>({vertexBufferLayout:{arrayStride:7*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x2",offset:0},{shaderLocation:1,format:"float32x2",offset:2*Float32Array.BYTES_PER_ELEMENT},{shaderLocation:2,format:"float32x3",offset:4*Float32Array.BYTES_PER_ELEMENT}],stepMode:"vertex"}});initializeShaderStates=(e,t)=>({vertexState:{module:e,entryPoint:"vertex_main",buffers:t},fragmentState:{module:e,entryPoint:"fragment_main",targets:[{format:navigator.gpu.getPreferredCanvasFormat(),blend:{color:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}}}]}});initializeLayouts=e=>{const t=e.createBindGroupLayout({label:"ResolutionBindGroupLayout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{}}]}),i=e.createBindGroupLayout({label:"TextureBindGroupLayout",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}}]});return{textureBindGroupLayout:i,pipelineLayout:e.createPipelineLayout({bindGroupLayouts:[t,i]}),resolutionBindGroupLayout:t}};createBindGroupAndPipeline=(e,t,i,o,n)=>({resolutionBindGroup:e.createBindGroup({layout:t.resolutionBindGroupLayout,entries:[{binding:0,resource:{buffer:o.resolutionBuffer}}]}),textureBindGroup:e.createBindGroup({layout:t.textureBindGroupLayout,entries:[{binding:0,resource:n.sampler},{binding:1,resource:n.texture.createView()}]}),renderPipeline:e.createRenderPipeline({layout:t.pipelineLayout,vertex:i.vertexState,fragment:i.fragmentState,primitive:{topology:"triangle-list"}})})}(async()=>{const e=(e=>{const t=document.createElement("canvas");t.width=800,t.height=600;const i=t.getContext("webgpu");if(!e)throw Error("Root element not found, please specify it.");if(!i)throw Error("Could not get the rendering context from canvas.");return e.appendChild(t),i})(document.getElementById("root")),t=[new d("0",[new c({x:75,y:530}),new s({height:25,width:50}),new n("rigid"),new u("uvTestTexture")]),new d("1",[new c({x:100,y:300}),new s({width:50,height:75}),new l({x:0,y:0},{x:750,y:500}),new r(1e3),new a(80),new n("dynamic"),new u("playerTexture")])],o=[new m(window),new i,new y,new g(e)],p=new h(e,t,o);await p.initialize(),p.loop(0)})()})();