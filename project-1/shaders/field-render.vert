precision mediump float;
uniform vec2 uScale;
varying vec2 fColor;
// Vertex position in World Coordinates
attribute vec2 vPosition;

//
const int MAX_PLANETS=10;
uniform float uRadius[MAX_PLANETS];
uniform vec2 uPosition[MAX_PLANETS];


//depois usar algo assim mas penso que não funcione

//cc=vPOsition
//output= o que enviar para o frag
/*void main() {
     /*Check if the pixel is inside the circle
       and color it with a gradient. Otherwise, color it 
       black   */
       
    /*if ( length(vPosition,  uPosition[1]) < uRadius[1]){
       fColor = vec4(1.0,0.0) ; //pintar vermelho por enquanto
    }else{
        fColor = vec4(0.0,0.0) ;
    }
    gl_Position = vec4(vPosition, 0.0, 1.0);
    }     
**/


//converter de Clip Space[-1,1] para World Space [-1.5, 1.5]
void main() 
{
   fColor=vPosition * uScale; //mudar isto pra fPosition
    gl_Position = vec4(vPosition, 0.0, 1.0);
    
}
