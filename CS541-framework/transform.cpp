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
            { 0.0f, cosA, sinA, 0.0f },
            { 0.0f, -sinA, cosA, 0.0f },
            { 0.0f, 0.0f, 0.0f, 1.0f },
            };
            break;
        //Y
        case 1:
            R = {
            { cosA, 0.0f, -sinA, 0.0f },
            { 0.0f, 1.0f, 0.0f, 0.0f },
            { sinA, 0.0f, cosA, 0.0f },
            { 0.0f, 0.0f, 0.0f, 1.0f },
            };
            break;
        //Z
        case 2:
            R = {
            { cosA, sinA, 0.0f, 0.0f },
            { -sinA, cosA, 0.0f, 0.0f },
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
    { 0.0f, 0.0f, -(back + front) / range, -2.0f * back * front / range },
    { 0.0f, 0.0f, -1.0f, 0.0f },
    };

    return P;
}

glm::mat4 LookAt(const glm::vec3 Eye, const glm::vec3 Center, const glm::vec3 Up) 
{
    glm::vec3 V = glm::normalize(Center - Eye);
    glm::vec3 A = glm::normalize(glm::cross(V, Up));
    glm::vec3 B = glm::cross(A, V);
    glm::mat4 result = glm::mat4(1);

    result[0][0] = A.x;
    result[1][0] = A.y;
    result[2][0] = A.z;
    result[3][0] = -glm::dot(A, Eye);

    result[0][1] = B.x;
    result[1][1] = B.y;
    result[2][1] = B.z;
    result[3][1] = -glm::dot(B, Eye);

    result[0][2] = -V.x;
    result[1][2] = -V.y;
    result[2][2] = -V.z;
    result[3][2] = glm::dot(V, Eye);

    return result;

    /*glm::vec3 V = glm::normalize(Center - Eye);
    glm::vec3 A = glm::normalize(glm::cross(V, Up));
    glm::vec3 B = glm::cross(A, V);

    const glm::mat4 T = Translate(-1 * Eye.x, -1 * Eye.y, -1 * Eye.z);

    glm::mat4 R =
    {
        A.x,  A.y,  A.z,  0.0f,
        B.x,  B.y,  B.z,  0.0f,
       -V.x, -V.y, -V.z,  0.0f,
        0.0f, 0.0f, 0.0f, 1.0f
    };
    R = glm::transpose(R);

    return R * T;*/
}
