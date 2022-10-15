precision mediump float;

const float PI = 3.14151;
const float TWO_PI = 2.0*PI;
const int MAX_PLANETS = 10;
const float MEDIUM_DENSITY = 5.51*pow(10.0,3.0); 
const float SCALE_FACTOR = 6.371 * pow(10.0,6.0);
const float UNIVERSAL_GRAVITATION = 6.67*pow(10.0,-11.0); // should work


uniform vec2 uScale;
varying vec2 fPosition;
// Vertex position in World Coordinates
attribute vec2 vPosition;




//converter de Clip Space[-1,1] para World Space [-1.5, 1.5] (ja ta feito)
void main() 
{              
    fPosition= vPosition * uScale; 
    gl_Position = vec4(vPosition, 0.0, 1.0);
    
}
