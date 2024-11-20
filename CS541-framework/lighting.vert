/////////////////////////////////////////////////////////////////////////
// Vertex shader for lighting
//
// Copyright 2013 DigiPen Institute of Technology
////////////////////////////////////////////////////////////////////////
#version 330

uniform mat4 WorldView, WorldInverse, WorldProj, ModelTr, NormalTr;
uniform mat4 ShadowMatrix; // Matrix to transform world space to light's clip space

in vec4 vertex;
in vec3 vertexNormal;
in vec2 vertexTexture;
in vec3 vertexTangent;

out vec3 worldPos;   
out vec3 normalVec;
out vec3 lightVec; 
out vec2 texCoord; 
out vec3 eyePos;
out vec3 tanVec;
out vec4 shadowCoord; // Shadow coordinates to pass to fragment shader

uniform vec3 lightPos;

void main()
{      
    // Transform vertex position into screen space
    gl_Position = WorldProj * WorldView * ModelTr * vertex;
    
    // Compute world-space position
    worldPos = (ModelTr * vertex).xyz;

    // Transform normal vector
    normalVec = vertexNormal * mat3(NormalTr);

    // Compute vector from fragment to light source
    lightVec = lightPos - worldPos;

    // Compute eye position in world space
    eyePos = (WorldInverse * vec4(0, 0, 0, 1)).xyz;

    // Transform tangent vector
    tanVec = mat3(ModelTr) * vertexTangent;

    // Pass texture coordinates
    texCoord = vertexTexture;

    // Compute shadow coordinates in light's clip space
    shadowCoord = ShadowMatrix * ModelTr * vertex;
}