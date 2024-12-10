/////////////////////////////////////////////////////////////////////////
// Vertex shader for reflection
//
// Copyright 2013 DigiPen Institute of Technology
////////////////////////////////////////////////////////////////////////
#version 330

uniform vec3 centerOfReflection;
uniform int reflectionHalf; // Uniform to indicate upper (+1) or lower (-1) pass

vec3 GetWorldPos();
void LightingVertex(vec3 eye);

void main()
{      
    LightingVertex(centerOfReflection);

    // Step 2: Set EYE to center-of-reflection and calculate R
    vec3 R = GetWorldPos() - centerOfReflection;
    float lengthR = length(R); 

    // Step 3: Normalize R to get (a, b, c)
    float a = R.x / lengthR;
    float b = R.y / lengthR;
    float c = R.z / lengthR;  // Third component of the normalized vector

    // Step 4: Dual-paraboloid mapping for gl_Position
    if (reflectionHalf > 0) 
    {
        // Upper paraboloid
        gl_Position = vec4(a / (1.0 + c), b / (1.0 + c), c * lengthR / 1000.0 - 1.0, 1.0);
    }
    else 
    {
        // Lower paraboloid
        gl_Position = vec4(a / (1.0 - c), b / (1.0 - c), -c * lengthR / 1000.0 - 1.0, 1.0);
    }
}