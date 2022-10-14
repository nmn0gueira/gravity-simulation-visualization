precision highp float;

const float PI = 3.14151;
const float TWO_PI = 2.0*PI;
const float SCALE_FACTOR = 6.371 * pow(10.0,6.0);
 // should work



varying vec2 fPosition;
varying vec2 force;

vec4 getDecimal(vec4 v)
{
return vec4(mod(v.x,1.0), mod(v.y,1.0), mod(v.w,1.0), mod(v.z,1.0));

}



vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}



void main() {
   float lf = length(force.xy);

    vec4 color = getDecimal(vec4(hsv2rgb(vec3(atan(force.y,force.x)/TWO_PI,1.0,1.0)),lf));
    // Verificar se é este o atributo que tem que ir e se é necessario usar o get decimal
    gl_FragColor = vec4(color);
}
