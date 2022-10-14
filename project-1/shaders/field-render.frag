precision highp float;

const float PI = 3.14151;
const float TWO_PI = 2.0*PI;
//const int MAX_PLANETS=10;
const float MEDIUM_DENSITY = 5.51*pow(10.0,3.0); 
const float SCALE_FACTOR = 6.371 * pow(10.0,6.0);
 // should work



varying vec2 fPosition;
varying vec2 force;

vec4 getDecimal(vec4 v)
{
return vec4(mod(v.x,1.0), mod(v.y,1.0), mod(v.w,1.0), mod(v.z,1.0));

}

//float planet_mass(float radius) {
  //  float mass = (4.0*PI*pow(radius,3.0)/3.0)*MEDIUM_DENSITY;

 //   return mass;
//}    

//float bodiesDistance(vec2 v1, vec2 v2){
 //  float dx = v1.x - v2.x, dy = v1.y - v2.y;
 //  return sqrt(dx*dx + dy*dy);
//}

//ISTO ESTA ASSIM PQ N TAVA A DAR
//float planet_force(int i, vec2 pos) {
 //    return 1.0;//UNIVERSAL_GRAVITATION*((1.0*planet_mass(uRadius[i]))/pow(bodiesDistance(uPosition[i],pos),2.0)); 
//}

//vec2 net_force(vec2 pos) {
//    vec2 force = vec2(0, 0);
//
 //   for(int i = 0; i < MAX_PLANETS; i++){
//        // calculates the force     
//         force = force + planet_force(i, pos);
//    }
//   return force;
//}


vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}



void main() {
    float lf = length(force.xy);

    vec4 color = vec4(hsv2rgb(vec3(atan(force.y,force.x)/TWO_PI,1.0,1.0)),lf);
    
    gl_FragColor = vec4(color);
}
