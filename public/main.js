(()=>{"use strict";const e=(e,t)=>e.components.find((e=>e.type===t)),t=(e,t)=>{const{x:i,y:n,height:o,width:r}=e,{x:a,y:s,height:c,width:u}=t;return i+r>a&&a+u>i&&n+o>s&&s+c>n};class i{initialize=async()=>{console.log("Collision system initialized.")};update=(i,r)=>{const a=[];for(const i of r){const r=e(i,"collider"),s=e(i,"position"),c=e(i,"dimensions"),u=e(i,"controllable"),l=e(i,"velocity");if(!r||!s||!c)continue;const d={...s.previousPosition,...c.dimensions},h={...s.position,...c.dimensions};if("dynamic"!==r.colliderType){a.push({boundingBox:h,entity:i,colliderComponent:r});continue}const p=a.filter((e=>t(e.boundingBox,h)));if(!p.length&&u&&(u.isGrounded=!1),l)for(const t of p){if("static"===t.colliderComponent.colliderType){const n=e(t.entity,"effect"),o=e(i,"effect");if(!n||!o)continue;for(const e of n.providers)o?.addUniqueConsumer(e);continue}const r=o(h),a=o(d),c=o(t.boundingBox);"rigid"!==t.colliderComponent.colliderType||n(l,r,a,c,s,h,u)}}}}const n=(e,t,i,n,o,r,a)=>{0!==e.velocity.x&&(t.right>=n.left&&i.right<=n.left&&(o.position.x=n.left-r.width,e.velocity.x=0),t.left<=n.right&&i.left>=n.right&&(o.position.x=n.right,e.velocity.x=0)),0!==e.velocity.y&&(t.bottom>=n.top&&i.bottom<=n.top&&(o.position.y=n.top-r.height,e.velocity.y=0),t.top<=n.bottom&&i.top>=n.bottom&&(o.position.y=n.bottom,e.velocity.y=0,a&&(a.isGrounded=!0,a.canJump=!0)))},o=e=>({right:e.x+e.width,left:e.x,top:e.y,bottom:e.y+e.height});class r{context;previousTimestamp=0;accumulatedTime=0;animationFrameId=null;canvas;constructor(e){this.context=e,this.canvas=e.canvas}initialize=async e=>{this.initializeCanvas(),this.initializeLoop(e),this.resizeCanvasToDisplaySize()};initializeCanvas=()=>{this.canvas.style.display="block",this.canvas.style.width="100vw",this.canvas.style.height="100vh"};initializeLoop=e=>{const t=()=>{this.animationFrameId||(this.previousTimestamp=performance.now(),window.requestAnimationFrame(e))};window.addEventListener("focus",t),window.addEventListener("blur",(()=>{this.animationFrameId&&(window.cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null)})),t()};resizeCanvasToDisplaySize=()=>{const e=this.canvas,t=e.clientWidth,i=e.clientHeight,n=e.width!==t||e.height!==i;return n&&(e.width=t,e.height=i),n}}class a{context;entities;systems;windowManager;constructor(e,t=[],i=[]){this.context=e,this.entities=t,this.systems=i}initialize=async()=>{for(const e of this.systems)await e.initialize();const e=new r(this.context);this.windowManager=e,e.initialize(this.loop)};loop=e=>{const t=1e3/240,i=e-this.windowManager.previousTimestamp;for(this.windowManager.previousTimestamp=e,this.windowManager.accumulatedTime+=i;this.windowManager.accumulatedTime>=t;)this.update(t),this.windowManager.accumulatedTime-=t;this.windowManager.animationFrameId=window.requestAnimationFrame(this.loop)};update=e=>{this.windowManager.resizeCanvasToDisplaySize();for(const t of this.systems)t.update(e,this.entities)}}class s{initialize=async()=>{console.log("Gravity system initialized.")};update=(t,i)=>{for(const n of i){const i=e(n,"gravity"),o=e(n,"velocity");if(!i||!o)continue;const r=o.velocity.y-9.8*i.mass*(t/1e3);r<=-1*o.maxVelocity.y?o.velocity.y=-1*o.maxVelocity.y:o.velocity.y=r}}}class c{window;constructor(e){this.window=e}initialize=async()=>{this.window.addEventListener("keydown",this.handleKeyDown),this.window.addEventListener("keyup",this.handleKeyUp)};keyboardState={a:!1,w:!1,s:!1,d:!1," ":!1};movementKeys=["a","w","s","d"," "];handleKeyDown=e=>{const t=e.key;this.movementKeys.includes(t)&&this.setMovementKeyState(t,!0)};handleKeyUp=e=>{const t=e.key;this.movementKeys.includes(t)&&this.setMovementKeyState(t,!1)};setMovementKeyState(e,t){this.keyboardState[e]=t}update=(t,i)=>{for(const n of i){const i=e(n,"controllable"),o=e(n,"velocity"),r=e(n,"position"),a=e(n,"animation");if(!i||!r||!o)continue;const s=i.speed*(t/1e3);this.hanldeKeyboardStates(s,o,i,a),this.handleBraking(s,o,a),r.previousPosition.x=r.position.x.valueOf(),r.previousPosition.y=r.position.y.valueOf(),r.position.x+=o.velocity.x*(t/1e3),r.position.y+=o.velocity.y*(t/1e3)}};hanldeKeyboardStates(e,t,i,n){this.keyboardState.a&&(n&&(n.facingDirection="left",n.currentAnimation=n.animationSheet.animations.find((e=>"run"===e.name))),t.velocity.x-=e*(i.isGrounded?1:.75),this.limitVelocity("x",t)),this.keyboardState.d&&(n&&(n.facingDirection="right",n.currentAnimation=n.animationSheet.animations.find((e=>"run"===e.name))),t.velocity.x+=e*(i.isGrounded?1:.75),this.limitVelocity("x",t)),this.keyboardState[" "]&&i.isGrounded&&i.canJump&&(i.canJump=!1,this.jump(t))}handleBraking(e,t,i){t.velocity.x>0&&!this.keyboardState.d&&(t.velocity.x-=3.5*e,t.velocity.x<0&&(t.velocity.x=0)),t.velocity.x<0&&!this.keyboardState.a&&(t.velocity.x+=3.5*e,t.velocity.x>0&&(t.velocity.x=0)),0===t.velocity.x&&i&&(i.currentAnimation=i.animationSheet.animations.find((e=>"idle"===e.name)))}limitVelocity(e,t){const i=t.velocity[e],n=t.maxVelocity[e];i>n?t.velocity[e]=n:i<-n&&(t.velocity[e]=-n)}jump(e){e.velocity.y=2500}}class u{static createVertexBuffer(e,t){const i=e.createBuffer({size:t.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Float32Array(i.getMappedRange()).set(t),i.unmap(),i}static createResolutionBuffer(e,t){const i=e.createBuffer({size:t.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Float32Array(i.getMappedRange()).set(t),i.unmap(),i}static createCameraBuffer(e,t){const i=e.createBuffer({size:t.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Float32Array(i.getMappedRange()).set(t),i.unmap(),i}static createIndexBuffer(e,t){const i=e.createBuffer({size:t.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Uint16Array(i.getMappedRange()).set(t),i.unmap(),i}}class l{vertices;inidices;constructor(e,t,i,n,{u:o,v:r}){this.vertices=[e,t,o[0],r[0],1,1,1,e+i,t,o[1],r[1],1,1,1,e+i,t+n,o[2],r[2],1,1,1,e,t+n,o[3],r[3],1,1,1],this.inidices=[0,1,2,0,3,2]}}class d{texture;sampler;id;width;height;constructor(e,t,i,n,o){this.texture=e,this.sampler=t,this.id=i,this.width=n,this.height=o}static async createTexture(e,t){const i=e.createTexture({size:{width:t.width,height:t.height},format:"rgba8unorm",usage:GPUTextureUsage.COPY_DST|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT}),n=await createImageBitmap(t);e.queue.copyExternalImageToTexture({source:n},{texture:i},{width:t.width,height:t.height});const o=e.createSampler({magFilter:"nearest",minFilter:"nearest"});return new d(i,o,t.src,t.width,t.height)}static async createTextureFromURL(e,t){const i=new Promise(((e,i)=>{const n=new Image;n.src=t,n.onload=()=>e(n),n.onerror=()=>{console.error(`Failed to load image ${t}`),i()}})),n=await i;return d.createTexture(e,n)}}const h=(e,t,i)=>{const{target:n,iteration:o}=p(e,t*i,0);return{x:n,y:o*t}},p=(e,t,i)=>{const n=e-t;return n<=0?p(e,-1*n,i+1):{target:t,iteration:i}};class m{context;device;renderPipeline;renderPass;cameraPosition;constructor(e){this.context=e}initialize=async()=>{const{device:e}=await this.initializeDevice();await w.initialize(e),this.cameraPosition={x:0,y:0},this.device=e};update=(t,i)=>{const n=this.device.createCommandEncoder(),o=n.beginRenderPass({colorAttachments:[{view:this.context.getCurrentTexture().createView(),loadOp:"clear",clearValue:{r:.85,g:.85,b:.85,a:1},storeOp:"store"}]});this.renderPass=o;for(const t of i){const i=e(t,"position"),n=e(t,"dimensions"),o=e(t,"sprite"),r=e(t,"camera_focus"),a=e(t,"animation");if(!i||!n||!o)continue;if(r){const e={x:i.position.x-this.context.canvas.width/2,y:i.position.y-this.context.canvas.height/2};this.cameraPosition.x+=.05*(e.x-this.cameraPosition.x),this.cameraPosition.y+=.05*(e.y-this.cameraPosition.y)}const s=u.createResolutionBuffer(this.device,new Float32Array([this.context.canvas.width,this.context.canvas.height])),c=u.createCameraBuffer(this.device,new Float32Array([this.cameraPosition.x,this.cameraPosition.y]));if(a&&a.currentAnimation){const e=w.animationSheets[a.animationSheet.name],t=a.currentAnimation,{x:o,y:r}=h(e.width,t.width,a.currentFrame),u=(o+("right"===a.facingDirection?0:t.width))/e.width,l=(r+.1)/e.height,d=(o+("right"===a.facingDirection?t.width:0))/e.width,p=(r+.1+t.height)/e.height;this.drawSprite(e,{...i.position,...n.dimensions},s,c,{u:[u,d,d,u],v:[p,p,l,l]})}this.drawSprite(w.textures[o.source],{...i.position,...n.dimensions},s,c,{u:[0,1,1,0],v:[1,1,0,0]})}o.end(),this.device.queue.submit([n.finish()])};drawSprite=(e,t,i,n,o)=>{const r=y.create(this.device,e,i,n),a=new l(t.x,t.y,t.width,t.height,o),s=u.createVertexBuffer(this.device,new Float32Array(a.vertices)),c=u.createIndexBuffer(this.device,new Uint16Array(a.inidices));this.renderPass.setPipeline(r.pipeline),this.renderPass.setIndexBuffer(c,"uint16"),this.renderPass.setVertexBuffer(0,s),this.renderPass.setBindGroup(0,r.resolutionBindGroup),this.renderPass.setBindGroup(1,r.cameraBindGroup),this.renderPass.setBindGroup(2,r.textureBindGroup),this.renderPass.drawIndexed(a.inidices.length)};initializeDevice=async()=>{if(!navigator.gpu)throw Error("Can not initialize gpu");const e=await navigator.gpu.requestAdapter();if(!e)throw Error("Could not request adapter");const t=await e.requestDevice();if(!t)throw Error("Could not request device");const i=navigator.gpu.getPreferredCanvasFormat();return this.context.configure({device:t,format:i}),{device:t}}}class w{static textures;static animationSheets;static async initialize(e){this.textures={playerTexture:await d.createTextureFromURL(e,"/assets/transparent_16x16.png"),redHitbox:await d.createTextureFromURL(e,"/assets/red_hitbox.png"),redTexture:await d.createTextureFromURL(e,"/assets/red_16x32.png"),blueTexture:await d.createTextureFromURL(e,"/assets/blue_16x16.png"),uvTestTexture:await d.createTextureFromURL(e,"/assets/uv_test.png"),brownBrick:await d.createTextureFromURL(e,"/assets/brown_brick_16x16.png"),blueArrow:await d.createTextureFromURL(e,"/assets/Arrow.png"),purplePortal:await d.createTextureFromURL(e,"/assets/Portal_16x32.png"),cobbleBrick:await d.createTextureFromURL(e,"/assets/cobble_16x16.png")},this.animationSheets={playerAnimationSheet:await d.createTextureFromURL(e,"/assets/Prototype-character/AnimationSheet.png")}}}class y{pipeline;textureBindGroup;resolutionBindGroup;cameraBindGroup;static create(e,t,i,n){const o=new y;return o.initialize(e,t,i,n),o}initialize(e,t,i,n){const o=e.createShaderModule({code:"struct VertexInput {\r\n    @location(0) position: vec2f,\r\n    @location(1) tex_coords: vec2f,\r\n    @location(2) color: vec3f,\r\n}\r\n\r\nstruct VertexOutput {\r\n    @builtin(position) position: vec4f,\r\n    @location(0) tex_coords: vec2f,\r\n    @location(1) color: vec4f,\r\n}\r\n\r\n@group(0) @binding(0) var<uniform> resolution: vec2f;\r\n@group(1) @binding(0) var<uniform> camera_position: vec2f;\r\n\r\n\r\nfn to_clip_space(position: vec2f) -> vec2<f32> {\r\n    // Add camera\r\n    let converted_position = position - camera_position;\r\n\r\n    // convert the position from pixels to a 0.0 to 1.0 value\r\n    let zero_to_one = converted_position / resolution;\r\n    // let zero_to_one = position / resolution;\r\n\r\n    // convert from 0 <-> 1 to 0 <-> 2\r\n    let zero_to_two = zero_to_one * 2.0;\r\n\r\n    // covert from 0 <-> 2 to -1 <-> +1 (clip space)\r\n    let clip_space = zero_to_two - 1.0;\r\n\r\n    // results into x,y=0 is at the bottom left.\r\n    return clip_space;\r\n}\r\n\r\n@vertex\r\nfn vertex_main(input: VertexInput) -> VertexOutput {\r\n    var output: VertexOutput;\r\n\r\n    output.position = vec4f(to_clip_space(input.position), 0.0, 1.0);\r\n    output.color = vec4f(input.color, 1.0);\r\n    output.tex_coords = input.tex_coords;\r\n\r\n    return output;\r\n}\r\n\r\n@group(2) @binding(0) var tex_sampler: sampler;\r\n@group(2) @binding(1) var tex: texture_2d<f32>;\r\n\r\n@fragment\r\nfn fragment_main(input: VertexOutput) -> @location(0) vec4f {\r\n    var texture_color = textureSample(tex, tex_sampler, input.tex_coords);\r\n    return input.color * texture_color;\r\n}\r\n",label:"Shaders.wgsl"}),{vertexBufferLayout:r}=this.initializeBufferLayouts(),{vertexState:a,fragmentState:s}=this.initializeShaderStates(o,[r]),{textureBindGroupLayout:c,pipelineLayout:u,resolutionBindGroupLayout:l,cameraBindGroupLayout:d}=this.initializeLayouts(e),{renderPipeline:h,resolutionBindGroup:p,textureBindGroup:m,cameraBindGroup:w}=this.createBindGroupAndPipeline(e,{pipelineLayout:u,textureBindGroupLayout:c,resolutionBindGroupLayout:l,cameraBindGroupLayout:d},{fragmentState:s,vertexState:a},{resolutionBuffer:i,cameraBuffer:n},t);this.resolutionBindGroup=p,this.cameraBindGroup=w,this.textureBindGroup=m,this.pipeline=h}initializeBufferLayouts=()=>({vertexBufferLayout:{arrayStride:7*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,format:"float32x2",offset:0},{shaderLocation:1,format:"float32x2",offset:2*Float32Array.BYTES_PER_ELEMENT},{shaderLocation:2,format:"float32x3",offset:4*Float32Array.BYTES_PER_ELEMENT}],stepMode:"vertex"}});initializeShaderStates=(e,t)=>({vertexState:{module:e,entryPoint:"vertex_main",buffers:t},fragmentState:{module:e,entryPoint:"fragment_main",targets:[{format:navigator.gpu.getPreferredCanvasFormat(),blend:{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}}}]}});initializeLayouts=e=>{const t=e.createBindGroupLayout({label:"ResolutionBindGroupLayout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{}}]}),i=e.createBindGroupLayout({label:"ResolutionBindGroupLayout",entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{}}]}),n=e.createBindGroupLayout({label:"TextureBindGroupLayout",entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT,sampler:{}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}}]});return{textureBindGroupLayout:n,pipelineLayout:e.createPipelineLayout({bindGroupLayouts:[t,i,n]}),resolutionBindGroupLayout:t,cameraBindGroupLayout:i}};createBindGroupAndPipeline=(e,t,i,n,o)=>({resolutionBindGroup:e.createBindGroup({layout:t.resolutionBindGroupLayout,entries:[{binding:0,resource:{buffer:n.resolutionBuffer}}]}),cameraBindGroup:e.createBindGroup({layout:t.cameraBindGroupLayout,entries:[{binding:0,resource:{buffer:n.cameraBuffer}}]}),textureBindGroup:e.createBindGroup({layout:t.textureBindGroupLayout,entries:[{binding:0,resource:o.sampler},{binding:1,resource:o.texture.createView()}]}),renderPipeline:e.createRenderPipeline({layout:t.pipelineLayout,vertex:i.vertexState,fragment:i.fragmentState,primitive:{topology:"triangle-list"}})})}const f={name:"playerAnimationSheet",width:192,height:144,totalFrames:42,animations:[{name:"idle",frames:[0,1],width:24,height:24,speed:1},{name:"kick",frames:[2,3],width:24,height:24,speed:1},{name:"attack",frames:[4,5],width:24,height:24,speed:1},{name:"damage",frames:[6,7],width:24,height:24,speed:1},{name:"walk",frames:[8,11],width:24,height:24,speed:1},{name:"run",frames:[12,15],width:24,height:24,speed:4},{name:"push",frames:[16,19],width:24,height:24,speed:1},{name:"pull",frames:[20,23],width:24,height:24,speed:1},{name:"jump",frames:[24,31],width:24,height:24,speed:1},{name:"win",frames:[32,35],width:24,height:24,speed:1},{name:"win",frames:[36,39],width:24,height:24,speed:1},{name:"sit",frames:[40,41],width:24,height:24,speed:1}]};class g{id;components;constructor(e,t){this.id=e,this.components=t}}class x{colliderType;type="collider";isColliding=!1;constructor(e){this.colliderType=e}}class v{providers;consumers;type="effect";constructor(e=[],t=[]){this.providers=e,this.consumers=t}addUniqueProvider=e=>{this.providers.includes(e)||this.providers.push(e)};addUniqueConsumer=e=>{this.consumers.includes(e)||this.consumers.push(e)};removeProviderEffect=e=>{const t=this.providers.filter((t=>t!==e));this.providers=t};removeConsumerEffect=e=>{const t=this.consumers.filter((t=>t!==e));console.log(t),this.consumers=t}}class b{speed;isGrounded;canJump;type="controllable";constructor(e,t=!1,i=!0){this.speed=e,this.isGrounded=t,this.canJump=i}}class B{dimensions;type="dimensions";constructor(e){this.dimensions=e}}class P{mass;type="gravity";constructor(e){this.mass=e}}class T{position;previousPosition;type="position";constructor(e,t={x:e.x.valueOf(),y:e.y.valueOf()}){this.position=e,this.previousPosition=t}}class G{source;type="sprite";constructor(e){this.source=e}}class S{animationSheet;timePerFrame;currentAnimation;currentFrame;timePassed;facingDirection;type="animation";constructor(e,t,i,n=0,o=0,r="right"){this.animationSheet=e,this.timePerFrame=t,this.currentAnimation=i,this.currentFrame=n,this.timePassed=o,this.facingDirection=r}}class _{type="camera_focus";constructor(){}}class L{velocity;maxVelocity;type="velocity";constructor(e,t={x:1/0,y:1/0}){this.velocity=e,this.maxVelocity=t}}class F extends g{constructor(e){super(e,[new T({x:200,y:300}),new B({width:96,height:96}),new L({x:0,y:0},{x:2e3,y:5e3}),new b(1e4),new P(1e3),new x("dynamic"),new _,new G("redHitbox"),new v,new S(f,250,f.animations.find((e=>"idle"===e.name)))])}}class A{initialize=async()=>{console.log("Animation system initialized.")};update=(t,i)=>{for(const n of i){const i=e(n,"animation");if(!i)continue;const[o,r]=i.currentAnimation.frames;i.currentFrame<o&&(i.currentFrame=o);const a=i.timePassed+t;a>=i.timePerFrame/i.currentAnimation.speed?(i.timePassed=0,i.currentFrame+1>r?i.currentFrame=o:i.currentFrame+=1):i.timePassed=a}}}class z extends Array{items;constructor(e=[]){super(new g("Arrow right 1",[new T({x:0,y:125}),new B({width:250,height:250}),new x("static"),new G("blueArrow")]),new g("Arrow right 2",[new T({x:500,y:125}),new B({width:250,height:250}),new x("static"),new v(["speed"]),new G("blueArrow")]),new g("Arrow right 3",[new T({x:1e3,y:125}),new B({width:250,height:250}),new x("static"),new G("blueArrow")]),new g("Blue wall Top left",[new T({x:0,y:500}),new B({width:1250,height:800}),new x("rigid"),new G("blueTexture")]),new g("Blue wall Bottom left",[new T({x:0,y:-1500}),new B({width:1500,height:1500}),new x("rigid"),new G("blueTexture")]),new g("Blue wall right",[new T({x:1750,y:-1e3}),new B({width:500,height:1e3}),new x("rigid"),new G("blueTexture")]),new g("Blue wall bottom right",[new T({x:1500,y:-1500}),new B({width:1e3,height:250}),new x("rigid"),new G("blueTexture")]),...U,...e),this.items=e}}const U=[new g("Portal bottom",[new T({x:2250,y:-1250}),new B({width:125,height:250}),new x("static"),new G("purplePortal"),new v(["teleport"])]),new g("Cobble",[new T({x:2250,y:-1e3}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")]),new g("Cobble bottom left",[new T({x:2375,y:-1250}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")]),new g("Cobble bottom middle",[new T({x:2500,y:-1250}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")]),new g("Cobble bottom right",[new T({x:2625,y:-1250}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")]),new g("Cobble middle left",[new T({x:2375,y:-1125}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")]),new g("Cobble middle middle",[new T({x:2500,y:-1125}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")]),new g("Cobble middle right",[new T({x:2625,y:-1125}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")]),new g("Cobble top left",[new T({x:2375,y:-1e3}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")]),new g("Cobble top middle",[new T({x:2500,y:-1e3}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")]),new g("Cobble top right",[new T({x:2625,y:-1e3}),new B({width:125,height:125}),new x("static"),new G("cobbleBrick")])];class C{initialize=async()=>{console.log("Effect system initialized")};update=(t,i)=>{for(const t of i){const i=e(t,"effect");if(i){console.log(i.consumers);for(const n of i.consumers){switch(n){case"teleport":console.log("Teleport entity where? lmao");break;case"speed":{console.log("Speed 2x"),console.log(t.id);const i=e(t,"velocity");if(console.log(t.components),!i)break;i.velocity.x*=1.175}}i.removeConsumerEffect(n)}}}}}(async()=>{const e=(e=>{const t=document.createElement("canvas");t.width=800,t.height=600;const i=t.getContext("webgpu");if(!e)throw Error("Root element not found, please specify it.");if(!i)throw Error("Could not get the rendering context from canvas.");return e.appendChild(t),i})(document.getElementById("root")),t=new z([new F("Player")]),n=[new c(window),new i,new C,new s,new A,new m(e)],o=new a(e,t,n);await o.initialize(),o.loop(0)})()})();