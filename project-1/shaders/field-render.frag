precision highp float;
varying vec2 fPosition;

vec2 getDecimal(vec2 v)
{
return vec2(mod(v.x,1.0),mod(v.y,1.0));

}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
// fazer contas de forças e pinta de acordo com a força em cada ponto user HSV
// e preciso passar os planetas do frag shader para o vertex shader
void main() {

    //vec2 pos = fPosition;

    //vec3 f = net_force(pos);

    //float lf = length(f.xy);

    //vec4 color = vec4(hsv2rgb(vec3(atan(f.y,f.x)/TWO_PI,1.0,1.0)),lf)
    
    gl_FragColor = vec4(getDecimal(fPosition), 0.0, 1.0);
}
