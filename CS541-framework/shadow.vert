#version 330

// Uniforms
uniform mat4 LightProj, LightView,  ModelTr;

// Vertex inputs
in vec4 vertex;

out vec4 position;

void main()
{      
    // Standard transformation to screen space
    gl_Position = LightProj * LightView * ModelTr * vertex;
    position = gl_Position;
}
