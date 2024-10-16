////////////////////////////////////////////////////////////////////////
// The scene class contains all the parameters needed to define and
// draw a simple scene, including:
//   * Geometry
//   * Light parameters
//   * Material properties
//   * Viewport size parameters
//   * Viewing transformation values
//   * others ...
//
// Some of these parameters are set when the scene is built, and
// others are set by the framework in response to user mouse/keyboard
// interactions.  All of them can be used to draw the scene.

#include "shapes.h"
#include "object.h"
#include "texture.h"
#include "fbo.h"

enum ObjectIds {
    nullId	= 0,
    skyId	= 1,
    seaId	= 2,
    groundId	= 3,
    roomId	= 4,
    boxId	= 5,
    frameId	= 6,
    lPicId	= 7,
    rPicId	= 8,
    teapotId	= 9,
    spheresId	= 10,
    floorId     = 11
};

class Shader;


class Scene
{
public:
    GLFWwindow* window;

    // @@ Declare interactive viewing variables here. (spin, tilt, ry, front back, ...)
    float spin, tilt;
    float tx, ty, zoom;
    float rx, ry;
    float front, back;

    glm::vec3 eye;
    float speed;
    bool w_down, a_down, s_down, d_down;
    bool transformation_mode;
    double lastTime;
    float deltaTime;

    // Light parameters
    float lightSpin, lightTilt, lightDist;
    glm::vec3 lightPos;
    // @@ Perhaps declare additional scene lighting values here. (lightVal, lightAmb)


    int mode; // Extra mode indicator hooked up to number keys and sent to shader
    
    // Viewport
    int width, height;

    // Transformations
    glm::mat4 WorldProj, WorldView, WorldInverse;

    // Light
    glm::vec3 ambientLight = glm::vec3(0.2, 0.2, 0.2);
    glm::vec3 lightIntensity = glm::vec3(3.0, 3.0, 3.0);

    // All objects in the scene are children of this single root object.
    Object* objectRoot;
    Object *central, *anim, *room, *floor, *teapot, *podium, *sky,
            *ground, *sea, *spheres, *leftFrame, *rightFrame;

    std::vector<Object*> animated;
    ProceduralGround* proceduralground;

    // Shader programs
    ShaderProgram* lightingProgram;
    // @@ Declare additional shaders if necessary


    // Options menu stuff
    bool show_demo_window;

    void InitializeScene();
    void BuildTransforms();
    void DrawMenu();
    void DrawScene();
    void UpdateTime();
    void HandleMovement();

};
