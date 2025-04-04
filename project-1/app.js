import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { vec2, flatten, subtract, dot,length } from '../../libs/MV.js';

// Buffers: particles before update, particles after update, quad vertices
let inParticlesBuffer, outParticlesBuffer, quadBuffer;

// Particle system constants

// Total number of particles
const N_PARTICLES = 100000;
const MAX_MINLIFE = 19;
const MIN_MINLIFE = 1;
const MAX_MAXLIFE = 20;
const MIN_MAXLIFE = 2;
const MAX_PLANETS = 10;
const MAX_BETA_ANGLE = Math.PI;
const MIN_BETA_ANGLE = 0;

let mousePosition;
let origin = vec2(0.0,0.0);
let maxLife = 10;
let minLife = 2;
let maxVel = 0.2;
let minVel = 0.1;
let beta = 0.0;
let alpha = 0.0;


//-------
let numberPlanets=0;
let planetInputCenter = vec2(0.0,0.0);
let planetInputBorder = vec2(0.0,0.0);

let planetRadiuses=[];
let planetCenters=[];

let drawPoints = true;
let drawField = true;

let time = undefined;

function main(shaders)
{

    // Generate the canvas element to fill the entire page
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /** type {WebGL2RenderingContext} */
    const gl = setupWebGL(canvas, {alpha: true});

    // Initialize GLSL programs    
    const fieldProgram = buildProgramFromSources(gl, shaders["field-render.vert"], shaders["field-render.frag"]);
    const renderProgram = buildProgramFromSources(gl, shaders["particle-render.vert"], shaders["particle-render.frag"]);
    const updateProgram = buildProgramFromSources(gl, shaders["particle-update.vert"], shaders["particle-update.frag"], ["vPositionOut", "vAgeOut", "vLifeOut", "vVelocityOut"]);

    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Enable Alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); 

    buildQuad();
    buildParticleSystem(N_PARTICLES);

    window.addEventListener("resize", function(event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0,0,canvas.width, canvas.height);
    });

    window.addEventListener("keydown", function(event) {
        console.log(event.key);
        switch(event.key) {
            case "PageUp":
                if(event.shiftKey) {
                    if(minVel == maxVel-0.1)
                        maxVel++;
    
                    minVel++;             
                }
                else{
                    maxVel++;
                }
                break;
            case "PageDown":
                if(event.shiftKey){
                    if (minVel>0.1)
                        minVel--;
                    
                    }  
                else {
                    if(maxVel>0.2){
                        if (maxVel == minVel + 0.1)
                            minVel--;
                    maxVel--;    
                    }
                }
                break;
            case "ArrowUp":
                if(beta < MAX_BETA_ANGLE) {
                    beta += Math.PI*0.01;
                }
                break;
            case "ArrowDown":
                if (beta > MIN_BETA_ANGLE) {
                    beta -= Math.PI*0.01;
                }
                break;
            case "ArrowLeft":
                alpha += Math.PI*0.01;
                break;
            case "ArrowRight":
                alpha -= Math.PI*0.01;
                break;
            case 'q':
                if (minLife < MAX_MINLIFE) {
                    if(minLife == maxLife-1) 
                    maxLife++
                minLife++;
                }        
                break;
            case 'a':
                if (minLife > MIN_MINLIFE)
                    minLife--;
                break;
            case 'w':
                if (maxLife < MAX_MAXLIFE)
                    maxLife++;
                break;
            case 's':
                if (maxLife > MIN_MAXLIFE) {
                    if (maxLife == minLife+1)
                    minLife--;
                maxLife--;
                }   
                break;
            case '0':
                drawField = !drawField;
                break;
            case '9':
                drawPoints  = !drawPoints;
                break; 
            case 'Shift':
                origin = mousePosition; 
              
        }
    });
    
    canvas.addEventListener("mousedown", function(event) {
        planetInputCenter = getCursorPosition(canvas, event);
        
    });

    canvas.addEventListener("mousemove", function(event) {
        const p = getCursorPosition(canvas, event);
        mousePosition = p;
        
        if(event.shiftKey)
           origin = p;

        console.log(p);
    });

    canvas.addEventListener("mouseup", function(event) {
        if (numberPlanets < MAX_PLANETS) {
            planetInputBorder= getCursorPosition(canvas, event);

            const planetRadius = getRadius(planetInputCenter,planetInputBorder);

            planetRadiuses.push(planetRadius);
            planetCenters.push(planetInputCenter);
    
            numberPlanets++;
        }

    })

    
    function getCursorPosition(canvas, event) {
  
       
        const mx = event.offsetX;
        const my = event.offsetY;

        const x = ((mx / canvas.width * 2) - 1)*1.5;
        const y = (((canvas.height - my)/canvas.height * 2) -1)*1.5*(canvas.height/canvas.width);

        return vec2(x,y);
    }

    window.requestAnimationFrame(animate);

    function buildQuad() {
        const vertices = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
                          -1.0, 1.0,  1.0, -1.0, 1.0,  1.0];
        
        quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    }


    function buildParticleSystem(nParticles) {
        const data = [];

        for(let i=0; i<nParticles; ++i) {
            // position
            const x = (Math.random() - 0.5) * 2*1.5;
            const y = (Math.random() - 0.5) * 2*1.5*(canvas.height/canvas.width);

            data.push(x); data.push(y);
            
            // age
            data.push(0.0);

            // life
            const life = minLife+Math.random()*(maxLife-minLife); 
            data.push(life);

            // velocity
            let theta = beta + Math.random()*2.0*(MAX_BETA_ANGLE - beta) + alpha;
            let cos = Math.cos(theta);
            let sin = Math.sin(theta);

            data.push(cos* (0.1 + Math.random() * (maxVel - minVel))); 
            data.push(sin* (0.1 + Math.random() * (maxVel - minVel))); 
        }

        inParticlesBuffer = gl.createBuffer();
        outParticlesBuffer = gl.createBuffer();

        // Input buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, inParticlesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STREAM_DRAW);

        // Output buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, outParticlesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STREAM_DRAW);
    }


    function animate(timestamp)
    {
        let deltaTime = 0;

        if(time === undefined) {        // First time
            time = timestamp/1000;
            deltaTime = 0;
        } 
        else {                          // All other times
            deltaTime = timestamp/1000 - time;
            time = timestamp/1000;
        }

        window.requestAnimationFrame(animate);

        // Clear framebuffer
        gl.clear(gl.COLOR_BUFFER_BIT);

        if(drawField) drawQuad();
        updateParticles(deltaTime);
        if(drawPoints) drawParticles(outParticlesBuffer, N_PARTICLES);

        swapParticlesBuffers();
    }

    function updateParticles(deltaTime)
    {
        // Setup uniforms
        const uDeltaTime = gl.getUniformLocation(updateProgram, "uDeltaTime");

        const uOrigin = gl.getUniformLocation(updateProgram, "uOrigin");// para o uOrigin

        const uMaxLife = gl.getUniformLocation(updateProgram, "uMaxLife");
        const uMinLife = gl.getUniformLocation(updateProgram, "uMinLife");

        const uMaxVel = gl.getUniformLocation(updateProgram, "uMaxVel");
        const uMinVel = gl.getUniformLocation(updateProgram, "uMinVel");
    
        const uBeta = gl.getUniformLocation(updateProgram,"uBeta");
        const uAlpha =gl.getUniformLocation(updateProgram,"uAlpha")

        gl.useProgram(updateProgram);

        gl.uniform1f(uDeltaTime, deltaTime);

        //update point of origin for new particles
        gl.uniform2fv(uOrigin, origin);

        //update maximum life a particle can have
        gl.uniform1f(uMaxLife, maxLife);

        //update minimum life a particle can have
        gl.uniform1f(uMinLife, minLife) 

        //update maximum velocity a particle can have
        gl.uniform1f(uMaxVel, maxVel);

        //update minimum velocity a particle can have
        gl.uniform1f(uMinVel, minVel);

        //update angle that indicates the central directon of velocity for new particles
        gl.uniform1f(uAlpha,alpha);

        //update maximum direction variation of new particles
        gl.uniform1f(uBeta,beta);

        for(let i=0; i<numberPlanets; i++) {
            // Get the location of the uniforms...
            const uPosition = gl.getUniformLocation(updateProgram, "uPosition[" + i + "]");
            const uRadius = gl.getUniformLocation(updateProgram, "uRadius[" + i + "]");
            // Send the corresponding values to the GLSL program
            gl.uniform2fv(uPosition, planetCenters[i]);
            gl.uniform1f(uRadius, planetRadiuses[i]);
        }
    
        // Setup attributes
        const vPosition = gl.getAttribLocation(updateProgram, "vPosition");
        const vAge = gl.getAttribLocation(updateProgram, "vAge");
        const vLife = gl.getAttribLocation(updateProgram, "vLife");
        const vVelocity = gl.getAttribLocation(updateProgram, "vVelocity");

        gl.bindBuffer(gl.ARRAY_BUFFER, inParticlesBuffer);
        
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(vAge, 1, gl.FLOAT, false, 24, 8);
        gl.vertexAttribPointer(vLife, 1, gl.FLOAT, false, 24, 12);
        gl.vertexAttribPointer(vVelocity, 2, gl.FLOAT, false, 24, 16);
        
        gl.enableVertexAttribArray(vPosition);
        gl.enableVertexAttribArray(vAge);
        gl.enableVertexAttribArray(vLife);
        gl.enableVertexAttribArray(vVelocity);

        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, outParticlesBuffer);
        gl.enable(gl.RASTERIZER_DISCARD);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, N_PARTICLES);
        gl.endTransformFeedback();
        gl.disable(gl.RASTERIZER_DISCARD);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    }

    function swapParticlesBuffers()
    {
        let auxBuffer = inParticlesBuffer;
        inParticlesBuffer = outParticlesBuffer;
        outParticlesBuffer = auxBuffer;
    }

    function drawQuad() {

        gl.useProgram(fieldProgram);

        const uScale =gl.getUniformLocation(fieldProgram, "uScale");
        gl.uniform2f(uScale, 1.5, 1.5 * canvas.height/canvas.width);

        for(let i=0; i<numberPlanets; i++) {
            // Get the location of the uniforms...
            const uPosition = gl.getUniformLocation(fieldProgram, "uPosition[" + i + "]");
            const uRadius = gl.getUniformLocation(fieldProgram, "uRadius[" + i + "]");
            // Send the corresponding values to the GLSL program
            gl.uniform2fv(uPosition, planetCenters[i]);
            gl.uniform1f(uRadius, planetRadiuses[i]);
        }

        // Setup attributes
        const vPosition = gl.getAttribLocation(fieldProgram, "vPosition"); 

        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.enableVertexAttribArray(vPosition);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function drawParticles(buffer, nParticles)
    {

        gl.useProgram(renderProgram);

        // Setup uniforms
        const uScale = gl.getUniformLocation(renderProgram, "uScale");
        gl.uniform2f(uScale, 1.5, 1.5 * canvas.height/canvas.width);

        // Setup attributes
        const vPosition = gl.getAttribLocation(renderProgram, "vPosition");

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.drawArrays(gl.POINTS, 0, nParticles);
    }

    function getRadius(){
        let v1 = flatten(planetInputCenter);
        let v2 = flatten(planetInputBorder);

        let dx = v1[0] - v2[0];
        let dy = v1[1] - v2[1];
  
        return Math.sqrt(dx*dx + dy*dy);
    }
}






loadShadersFromURLS([
    "field-render.vert", "field-render.frag",
    "particle-update.vert", "particle-update.frag", 
    "particle-render.vert", "particle-render.frag"
    ]
).then(shaders=>main(shaders));
