precision mediump float;

uniform vec2 uScale;

attribute vec2 vPosition;
attribute float vAge;
attribute float vLife;
attribute vec2 vVelocity;

varying float fLeft;

void main() {
  gl_PointSize = 2.0;
  fLeft = vAge;
  gl_Position = vec4(vPosition/uScale, 0.0, 1.0);
}