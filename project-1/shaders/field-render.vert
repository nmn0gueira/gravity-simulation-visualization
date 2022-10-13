precision mediump float;
uniform vec2 uScale;
varying vec2 fColor;
// Vertex position in World Coordinates
attribute vec2 vPosition;


//converter de Clip Space[-1,1] para World Space [-1.5, 1.5]
void main() 
{
    fColor=vPosition * uScale; //mudar isto pra fPosition
    gl_Position = vec4(vPosition, 0.0, 1.0);
    
}
