/////////////////////////////////////////////////////////////////////////
// Pixel shader for lighting
/////////////////////////////////////////////////////////////////////////
#version 330

uniform int objectId;
uniform bool useSkyReflect;
uniform sampler2D skyDomeTexture;
uniform sampler2D shadowMap; // Ensure shadowMap is defined here
uniform bool isReflective; 
uniform sampler2D upperReflectionMap; 
uniform sampler2D lowerReflectionMap;

vec3 GetV();
vec3 GetN();
void LightingPixel();
void AddFragColorValue(vec4 addValue);

void main()
{      
    vec3 N = GetN();
    vec3 V = GetV();

    LightingPixel();

    if (isReflective) 
    { 
        vec3 R = 2.0 * dot(V, N) * N - V;
        float lengthR = length(R); 

        float a = R.x / lengthR;
        float b = R.y / lengthR;
        float c = R.z / lengthR;


        // Dual-Paraboloid Mapping
        vec2 uv;
        vec3 reflectionColor;
        if (c > 0.0) {
            // Top paraboloid
            uv = vec2(a / (1.0 + c), b / (1.0 + c)) * 0.5 + vec2(0.5,0.5);
            reflectionColor = texture(upperReflectionMap, uv).rgb ;

            //For debugging
            //reflectionColor = vec3(0.0f,0.0f,1.0f);
        } else {
            // Bottom paraboloid
            uv = vec2(a / (1.0 - c), b / (1.0 - c)) * 0.5 + vec2(0.5,0.5);
            reflectionColor = texture(lowerReflectionMap, uv).rgb; 

            //For debugging
            //reflectionColor = vec3(1.0f,0.0f,0.0f);
        }

        // Combine reflection with lighting 
        AddFragColorValue(vec4( reflectionColor, 1.0));
    }
}