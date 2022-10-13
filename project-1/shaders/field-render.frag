precision highp float;
varying vec2 fColor;

vec2 getDecimal(vec2 v)
{
return vec2(mod(v.x,1.0),mod(v.y,1.0));

}
// fazer contas de forças e pinta de acordo com a força em cada ponto user HSV
void main() {

    //vec2 pos = fPosition;

    //vec3 f = net_force(pos);

    //float lf = length(f.xy);

    //vec4 color = vec4(hsv2rgb(vec3(atan(f.y,f.x)/TWO_PI,1.0,1.0)),lf)
    
    gl_FragColor = vec4(getDecimal(fColor), 0.0, 1.0);
}
