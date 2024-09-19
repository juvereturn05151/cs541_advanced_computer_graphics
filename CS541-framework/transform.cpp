////////////////////////////////////////////////////////////////////////
// A small library of 4x4 matrix operations needed for graphics
// transformations.  glm::mat4 is a 4x4 float matrix class with indexing
// and printing methods.  A small list or procedures are supplied to
// create Rotate, Scale, Translate, and Perspective matrices and to
// return the product of any two such.

#include <glm/glm.hpp>

#include "math.h"
#include "transform.h"

float* Pntr(glm::mat4& M)
{
    return &(M[0][0]);
}

//@@ The following procedures should calculate and return 4x4
//transformation matrices instead of the identity.

// Return a rotation matrix around an axis (0:X, 1:Y, 2:Z) by an angle
// measured in degrees.  NOTE: Make sure to convert degrees to radians
// before using sin and cos.  HINT: radians = degrees*PI/180
const float pi = 3.14159f;
glm::mat4 Rotate(const int i, const float theta)
{
    glm::mat4 R(1.0);
    const float radian = theta * pi / 180.0f;
    const float cosA = cos(radian);
    const float sinA = sin(radian);

    switch (i)
    {
        //X
        case 0:
            R = {
            { 1.0f, 0.0f, 0.0f, 0.0f },
            { 0.0f, cosA, -sinA, 0.0f },
            { 0.0f, sinA, cosA, 0.0f },
            { 0.0f, 0.0f, 0.0f, 1.0f },
            };
            break;
        //Y
        case 1:
            R = {
            { cosA, 0.0f, sinA, 0.0f },
            { 0.0f, 1.0f, 0.0f, 0.0f },
            { -sinA, 0.0f, cosA, 0.0f },
            { 0.0f, 0.0f, 0.0f, 1.0f },
            };
            break;
        //Z
        case 2:
            R = {
            { cosA, -sinA, 0.0f, 0.0f },
            { sinA, cosA, 0.0f, 0.0f },
            { 0.0f, 0.0f, 1.0f, 0.0f },
            { 0.0f, 0.0f, 0.0f, 1.0f },
            };
            break;
        default:
        break;
    }

    return R;
}

// Return a scale matrix
glm::mat4 Scale(const float x, const float y, const float z)
{
    glm::mat4 S(1.0);

    S = {
    { x, 0.0f, 0.0f, 0.0f },
    { 0.0f, y, 0.0f, 0.0f },
    { 0.0f, 0.0f, z, 0.0f },
    { 0.0f, 0.0f, 0.0f, 1.0f },
    };

    return S;
}

// Return a translation matrix
glm::mat4 Translate(const float x, const float y, const float z)
{
    glm::mat4 T(1.0);

    T = {
    { 1.0f, 0.0f, 0.0f, 0.0f },
    { 0.0f, 1.0f, 0.0f, 0.0f },
    { 0.0f, 0.0f, 1.0f, 0.0f },
    { x, y, z, 1.0f },
    };

    return T;
}

// Returns a perspective projection matrix
glm::mat4 Perspective(const float rx, const float ry,
             const float front, const float back)
{
    glm::mat4 P(1.0);
    float range = back - front;

    P = {
    { 1.0f / rx, 0.0f, 0.0f, 0.0f },
    { 0.0f, 1.0f / ry, 0.0f, 0.0f },
    { 0.0f, 0.0f, -(back + front) / range, -(2 * front * back) / range },
    { 0.0f, 0.0f, -1.0f, 0.0f },
    };

    return P;
}


