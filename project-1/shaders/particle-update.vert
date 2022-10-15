
precision mediump float;
const int MAX_PLANETS = 10;

const float UNIVERSAL_GRAVITATION = 6.67*pow(10.0,-11.0); // should work
const int MASS = 1; // every particle has a mass of 1 kg

/* Number of seconds (possibly fractional) that has passed since the last
   update step. */
uniform float uDeltaTime;

/* Point of coordinates where the particles will spawn
*/
uniform vec2 uOrigin;

/* All planets' positions
*/
uniform vec2 uPosition[MAX_PLANETS];

/* All planets' radiuses
*/
uniform float uRadius[MAX_PLANETS];  // em vez de MAX_PLANETS pode ser que se ponha a 0 ou com o numero de planetas de momento

//gl.getUniformLocation(...,"uRadius")
//fazer contas gravidade??

// Starting maximum life of a particle [2,20]
uniform highp float uMaxLife;

// Starting minimum life of a particle [1,19]
uniform highp float uMinLife;

/* Inputs. These reflect the state of a single particle before the update. */


attribute vec2 vPosition;              // actual position
attribute float vAge;                  // actual age (in seconds)
attribute float vLife;                 // when it is supposed to dye 
attribute vec2 vVelocity;              // actual speed

/* Outputs. These mirror the inputs. These values will be captured into our transform feedback buffer! */
varying vec2 vPositionOut;
varying float vAgeOut;
varying float vLifeOut;
varying vec2 vVelocityOut;

// generates a pseudo random number that is a function of the argument. The argument needs to be constantly changing from call to call to generate different results
highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

void main() {

   /* Update parameters according to our simple rules.*/
   vPositionOut = vPosition + vVelocity * uDeltaTime; // p(t+h) = p(t) + v(t) * h 
   vAgeOut = vAge + uDeltaTime;
   vLifeOut = vLife;

   // EM VEZ DE accel, AQUI DEVIA ESTAR A FUNCAO net_force(vPosition) QUE VAI TOMAR EM CONTA FORCA GRAVITICA
   vec2 accel = vec2(0.0);
   vVelocityOut = vVelocity + accel * uDeltaTime;  //  v(t+h) = v(t) + F(t)/m * h 
      
   if (vAgeOut >= vLife) {
      vAgeOut = 0.0;
      vPositionOut = uOrigin;
      vLifeOut = uMinLife+rand(vec2(vAge,vPosition))*(uMaxLife-uMinLife); // n tenho a certeza se randomiza de maneira diferente para cada particula
      //mandar as particulas numa direçao aleatoria entre dois parametros
   }
}