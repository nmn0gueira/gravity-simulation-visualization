precision mediump float;

const int MAX_PLANETS=10;
const float PI = 3.14151;
const float MEDIUM_DENSITY = 5.51*pow(10.0,3.0); 
const float SCALE_FACTOR = 6.371 * pow(10.0,6.0);


uniform vec2 uScale;
varying vec2 fPosition;
// Vertex position in World Coordinates
attribute vec2 vPosition;

//

uniform float uRadius[MAX_PLANETS];
uniform vec2 uPosition[MAX_PLANETS];
// mass = (4*PI*pow(radius,3.0)/3)* density         FUNCAO QUE CALCULA A MASSA

//for (int i = 0; i<1; i++) { // definir os planetas no field
    
//}


//depois usar algo assim mas penso que não funcione

//cc=vPOsition
//output= o que enviar para o frag
/*void main() {
     /*Check if the pixel is inside the circle
       and color it with a gradient. Otherwise, color it 
       black   */
       
    /*if ( length(vPosition,  uPosition[1]) < uRadius[1]){
       fPosition = vec4(1.0,0.0) ; //pintar vermelho por enquanto
    }else{
        fPosition = vec4(0.0,0.0) ;
    }
    gl_Position = vec4(vPosition, 0.0, 1.0);
    }     
**/


//converter de Clip Space[-1,1] para World Space [-1.5, 1.5] (ja ta feito)
void main() 
{
    fPosition=vPosition * uScale; //mudar isto pra fPosition
    gl_Position = vec4(vPosition, 0.0, 1.0);
    
}
