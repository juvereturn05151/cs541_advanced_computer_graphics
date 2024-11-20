#version 330

out vec4 FragColor;

in vec4 position;

void main()
{
    FragColor = position;
}