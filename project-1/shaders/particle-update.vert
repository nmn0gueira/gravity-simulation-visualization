
precision mediump float;
const float PI = 3.14151;
const int MAX_PLANETS = 10;
const float MEDIUM_DENSITY = 5.51*pow(10.0,3.0); 
const float SCALE_FACTOR = 6.371 * pow(10.0,6.0);
const float UNIVERSAL_GRAVITATION = 6.67*pow(10.0,-11.0); // should work

/* Number of seconds (possibly fractional) that has passed since the last
   update step. */
uniform float uDeltaTime;

/* Point of coordinates where the particles will spawn
*/
uniform vec2 uOrigin;

/* All planets' radiuses
*/
uniform float uRadius[MAX_PLANETS];  // em vez de MAX_PLANETS pode ser que se ponha a 0 ou com o numero de planetas de momento

/* All planets' positions
*/
uniform vec2 uPosition[MAX_PLANETS];

// Starting maximum life of a particle [2,20]
uniform float uMaxLife;

// Starting minimum life of a particle [1,19]
uniform float uMinLife;

uniform float uMaxBeta;

uniform float uMinBeta;

uniform float uAlpha;

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



float planet_mass(float radius) {
    float mass = (4.0*PI*pow(radius*SCALE_FACTOR,3.0)/3.0)*MEDIUM_DENSITY;

    return mass;
}    

float bodiesDistance(vec2 v1, vec2 v2){
   float dx = v1.x - v2.x;
   float dy = v1.y - v2.y;
   return sqrt(dx*dx + dy*dy)*SCALE_FACTOR;
}


vec2 planet_force(vec2 planetPos, float radius, vec2 particlePos) {
   if (bodiesDistance(planetPos,particlePos) <= radius) {
      vAgeOut = vLife;
   }

   return normalize(planetPos-particlePos)* UNIVERSAL_GRAVITATION*((1.0*planet_mass(radius))/pow(bodiesDistance(planetPos,particlePos),2.0)); 
}

vec2 net_force(vec2 pos) {
    vec2 force = vec2(0.0, 0.0);

    for(int i = 0; i < MAX_PLANETS; i++){
        // calculates the force     
         force = force + planet_force(uPosition[i], uRadius[i], pos);
    }

    return force;
}



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

   //float theta = uMinTheta + rand(vPosition + uDeltaTime)*(uMaxTheta - uMinTheta);
   //ao aumentar o minTheta diminui o maxTheta
   float theta = uMinBeta + rand(vPosition + uDeltaTime)*(2.0*uMaxBeta - uMinBeta) + uAlpha;
   float x = cos(theta);
   float y = sin(theta);
   

   //float angle = alpha + beta - rand(vPosition*uDeltaTime)*2.0*beta;

   vPositionOut = vPosition + vVelocity * uDeltaTime; // p(t+h) = p(t) + v(t) * h 
   vAgeOut = vAge + uDeltaTime;
   vLifeOut = vLife;

   // EM VEZ DE accel, AQUI DEVIA ESTAR A FUNCAO net_force(vPosition) QUE VAI TOMAR EM CONTA FORCA GRAVITICA
   vec2 accel = net_force(vPositionOut);
   vVelocityOut = vVelocity + accel * uDeltaTime;  //  v(t+h) = v(t) + F(t)/m * h 
      
   if (vAgeOut >= vLife) {
      float r1 = rand(vPosition);
      float r2 = rand(vPosition*uDeltaTime);

      vAgeOut = 0.0;
      vPositionOut = uOrigin;
      vLifeOut = uMinLife+r2*(uMaxLife-uMinLife);
      vVelocityOut = vec2(x, y) * (0.1 + rand(vPosition) * (0.2 - 0.1));  // calcular isto de forma semelhante a vida 
      //vVelocityOut = vec2(x, y) * (velocityMin + rand(vPosition) * (velocityMax - velocityMin));
   }
}