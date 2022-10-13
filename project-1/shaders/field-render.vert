precision mediump float;
uniform float scaleX,scaleY;
varying vec2 fColor;
// Vertex position in World Coordinates
attribute vec2 vPosition;





void main() 
{
   
    gl_Position = vec4(vPosition.x*scaleX,vPosition.y*scaleY, 0.0, 1.0);

    fColor=vPosition;
}
