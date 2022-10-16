import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { vec2, flatten, subtract, dot,length } from '../../libs/MV.js';

// Buffers: particles before update, particles after update, quad vertices
let inParticlesBuffer, outParticlesBuffer, quadBuffer;

// Particle system constants

// Total number of particles
const N_PARTICLES = 100000; // O NUMERO DE PARTICULAS TEM DE SER 1 MILHAO (10 ELEVADO A 6) OU 100000
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
let maxBeta = Math.PI;
let minBeta = 0.0;
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
                break;
            case "PageDown":
                break;
            case "ArrowUp":
                if(maxBeta < MAX_BETA_ANGLE) {
                    maxBeta += 0.1;
                    minBeta -= 0.1;
                }
                break;
            case "ArrowDown":
                if (maxBeta > MIN_BETA_ANGLE) {
                    minBeta += 0.1;
                    maxBeta -= 0.1;
                }
                break;
            case "ArrowLeft":
                alpha=alpha+1.0;
                break;
            case "ArrowRight":
                alpha=alpha-1.0;
                break;
            case 'q': //aumentar minLife
                if (minLife < MAX_MINLIFE) {
                    if(minLife == maxLife-1) 
                    maxLife++
                minLife++;
                }        
                break;
            case 'a': //diminuir minLife
                if (minLife > MIN_MINLIFE)
                    minLife--;
                break;
            case 'w': //aumentar maxLife
                if (maxLife < MAX_MAXLIFE)
                    maxLife++;
                break;
            case 's': //diminuir maxLife
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
            let keysPressed = {};
            window.addEventListener('keydown', function(event)  {
                keysPressed[event.key] = true;
             
                if (keysPressed['Shift'] && event.key == 'PageUp') {
                    alert(event.key);
                    return;
                }
                else if (keysPressed['Shift']&& event.key =='PageDown'){
                    alert(event.key);
                    return;
                   

                } 
                else{
                    origin = mousePosition; 
                }
            
            });

              
           
        }
    })
    
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
        planetInputBorder= getCursorPosition(canvas, event);

        const planetRadius = getRadius(planetInputCenter,planetInputBorder);

        planetRadiuses.push(planetRadius);
        planetCenters.push(planetInputCenter);
    
        //alert(planetCenters[numberPlanets]);
        numberPlanets++;

    })

    
    function getCursorPosition(canvas, event) {
  
       
        const mx = event.offsetX;
        const my = event.offsetY;

        const x = ((mx / canvas.width * 2) - 1)*1.5;
        const y = (((canvas.height - my)/canvas.height * 2) -1)*1.5*(canvas.height/canvas.width); //alteraçao a seguir ao 1.5

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
            const life = 6.0 + Math.random();
            data.push(life);

            // velocity
            data.push(0.1*(Math.random() - 0.5));
            data.push(0.1*(Math.random() - 0.5));
            //let rand = Math.random()*(2*Math.PI)+1; 
            //data.push(0.1*(Math.cos(rand)/Math.sin(rand)));
            //rand = Math.random()*(2*Math.PI)+1;
            //data.push(0.1*(Math.sin(rand)/Math.cos(rand)));
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

        //const uMaxVel = gl.getUniformLocation(updateProgram, "uMaxVel");
        //const uMinVel = gl.getUniformLocation(updateProgram, "uMinVel");
        const uMaxBeta =gl.getUniformLocation(updateProgram,"uMaxBeta");
        const uMinBeta = gl.getUniformLocation(updateProgram,"uMinBeta");
        const uAlpha =gl.getUniformLocation(updateProgram,"uAlpha")

        gl.useProgram(updateProgram);

        gl.uniform1f(uDeltaTime, deltaTime);

        //atualizar a posição do cursor
        gl.uniform2fv(uOrigin, origin); // isto so acontece clicando no shift

        //atualizar a vida maxima de particulas
        gl.uniform1f(uMaxLife, maxLife);

        //atualizar a vida minima de particulas
        gl.uniform1f(uMinLife, minLife)


       

        //atualizar a velocidade maxima das particulas
        //gl.uniform2fv(uMaxVel, maxVel);

        //atualizar a velocidade minima das particulas
        //gl.uniform2fv(uMinVel, minVel);
        gl.uniform1f(uMaxBeta,maxBeta);
        gl.uniform1f(uMinBeta,minBeta);
        gl.uniform1f(uAlpha,alpha);

        for(let i=0; i<numberPlanets; i++) {
            // Get the location of the uniforms...
            const uPosition = gl.getUniformLocation(updateProgram, "uPosition[" + i + "]");
            const uRadius = gl.getUniformLocation(updateProgram, "uRadius[" + i + "]");
            // Send the corresponding values to the GLSL program
            gl.uniform2fv(uPosition, planetCenters[i]);
            gl.uniform1f(uRadius, planetRadiuses[i]);
            //alert(planetCenters[i]);
            //alert(planetRadiuses[i]);
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
            //alert(planetCenters[i]);
            //alert(planetRadiuses[i]);
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

    //verificar se é a funçao certa para calcular a distancia
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
