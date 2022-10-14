precision mediump float;

const float PI = 3.14151;
const float TWO_PI = 2.0*PI;
const int MAX_PLANETS=10;
const float MEDIUM_DENSITY = 5.51*pow(10.0,3.0); 
const float SCALE_FACTOR = 6.371 * pow(10.0,6.0);
const float UNIVERSAL_GRAVITATION = 6.67*pow(10.0,-11.0); // should work

uniform float uRadius[MAX_PLANETS];
uniform vec2 uPosition[MAX_PLANETS];


uniform vec2 uScale;
varying vec2 fPosition;
varying vec2 force;
// Vertex position in World Coordinates
attribute vec2 vPosition;


float planet_mass(float radius) {
    float mass = (4.0*PI*pow(radius,3.0)/3.0)*MEDIUM_DENSITY;

    return mass;
}    

float bodiesDistance(vec2 v1, vec2 v2){
   float dx = v1.x - v2.x, dy = v1.y - v2.y;
   return sqrt(dx*dx + dy*dy);
}


vec2 planet_force(vec2 pos, float radius) {
     return pos * UNIVERSAL_GRAVITATION*((1.0*planet_mass(radius))/pow(bodiesDistance(pos,fPosition),2.0)); 
}

vec2 net_force(vec2 pos) {
    vec2 force = vec2(0, 0);

    for(int i = 0; i < MAX_PLANETS; i++){
        // calculates the force     
         force = force + planet_force(uPosition[i], uRadius[i]);
    }
   return force;
}



//converter de Clip Space[-1,1] para World Space [-1.5, 1.5] (ja ta feito)
void main() 
{

    vec2 pos = fPosition;

    vec2 f = net_force(pos);                                                                            // nao sei se e vec3 ou vec2

    fPosition= vPosition * uScale; //mudar isto pra fPosition
    force=f;
    gl_Position = vec4(vPosition, 0.0, 1.0);
    
}
