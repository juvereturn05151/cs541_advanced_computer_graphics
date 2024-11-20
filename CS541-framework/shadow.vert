#version 330

// Uniforms
uniform mat4 ProjectionMatrix, ViewMatrix,  ModelTr;

// Vertex inputs
in vec4 vertex;

out vec4 position;

void main()
{      
    // Standard transformation to screen space
    gl_Position = ProjectionMatrix * ViewMatrix * ModelTr * vertex;
    position = gl_Position;
}
