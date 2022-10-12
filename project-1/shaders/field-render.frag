precision highp float;
varying vec2 fColor;

vec2 getDecimal(vec2 v)
{
return vec2(mod(v.x,1.0),mod(v.y,1.0));

}

void main() {
    
    gl_FragColor = vec4(getDecimal(fColor), 0.0, 1.0);
}
