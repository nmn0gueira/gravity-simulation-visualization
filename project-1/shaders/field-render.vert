precision mediump float;

uniform vec2 uScale;
varying vec2 fPosition;

// Vertex position in World Coordinates
attribute vec2 vPosition;



void main() 
{              
    fPosition= vPosition * uScale; 
    gl_Position = vec4(vPosition, 0.0, 1.0);
    
}
