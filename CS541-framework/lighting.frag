/////////////////////////////////////////////////////////////////////////
// Pixel shader for lighting
////////////////////////////////////////////////////////////////////////
#version 330

out vec4 FragColor;

// These definitions agree with the ObjectIds enum in scene.h
const int     nullId	= 0;
const int     skyId	= 1;
const int     seaId	= 2;
const int     groundId	= 3;
const int     roomId	= 4;
const int     boxId	= 5;
const int     frameId	= 6;
const int     lPicId	= 7;
const int     rPicId	= 8;
const int     teapotId	= 9;
const int     spheresId	= 10;
const int     floorId	= 11;

in vec3 normalVec;   // fragNormal
in vec3 lightVec;   
in vec3 worldPos;   // fragPos
in vec2 texCoord;  

uniform int objectId;
uniform vec3 diffuse;
uniform vec3 specular;
uniform float shininess;
uniform vec3 eye; //viewPos
uniform vec3 ambientLight; 
uniform vec3 lightIntensity;

vec3 getF(float LdotH, vec3 Ks) 
{
    return Ks + (1.0 - Ks) * pow(1.0 - LdotH, 5.0);
}

float getG(float LdotH)
{
    float LH_pow_2 = pow(LdotH, 2);
    LH_pow_2 = max(LH_pow_2, 0.00001);
    return 1.0f / LH_pow_2;
}

float getD(vec3 N, vec3 H, float roughness) 
{
    float first_part =  (roughness + 2.0) /(2.0 / 3.14159);
    float second_part = pow(max(dot(N, H), 0.0) , roughness); 
    return first_part * second_part;
}

void main()
{
    vec3 N = normalize(normalVec);
    vec3 L = normalize(lightVec - worldPos);
    vec3 V = normalize(eye - worldPos);   
    vec3 H = normalize(L + V);

    vec3 Kd = diffuse;   
    vec3 Ks = specular;  

    float NdotL = max(dot(N, L), 0.0);
    float NdotV = max(dot(N, V), 0.0);
    float NdotH = max(dot(N, H), 0.0);
    float VdotH = max(dot(V, H), 0.0);
    float LdotH = max(dot(L, H), 0.0);

    vec3 F = getF(LdotH, Ks);

    float G = getG(LdotH);

    float D = getD(N, H, shininess);

    vec3 BRDF_diffuse = (Kd / 3.14159);  
    vec3 BRDF = BRDF_diffuse +( (F * G * D) / (4.0));

    // A checkerboard pattern to break up large flat expanses.  Remove when using textures.

    if (objectId==groundId || objectId==floorId || objectId==seaId)
    {
        ivec2 uv = ivec2(floor(100.0*texCoord));
        if ((uv[0]+uv[1])%2==0)
            Kd *= 0.9; 
    }

    vec3 scene_ambient = ambientLight * Kd; 
    vec3 IiNdotL = lightIntensity * NdotL;

    vec3 finalColor = scene_ambient + IiNdotL * BRDF;
    
    FragColor = vec4(finalColor, 1.0);
}
