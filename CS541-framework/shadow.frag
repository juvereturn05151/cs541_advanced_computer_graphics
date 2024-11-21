#version 330

out vec4 FragColor;

in vec4 position;

void main()
{
    FragColor = vec4(position.w/100.0f);
}