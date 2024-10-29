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
in vec3 eyePos;
in vec3 tanVec;

uniform int objectId;
uniform vec3 diffuse;
uniform vec3 specular;
uniform float shininess;
uniform vec3 ambientLight; 
uniform vec3 lightIntensity;

uniform sampler2D tex;
uniform sampler2D normalMap;  
uniform bool useNormalMap; 
uniform sampler2D skyDomeTexture;
uniform bool useSkyReflect; 

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

float getD(vec3 N, vec3 H, float shininess) 
{
    float first_part =  (shininess + 2.0) /(2.0 * 3.14159);
    float second_part = pow(max(dot(N, H), 0.0) , shininess); 
    return first_part * second_part;
}

vec3 getSkyReflection(vec3 V, vec3 N)
{
    // Calculate reflection vector R
    vec3 R = -reflect(V, N);
    
    // Calculate UV coordinates for the sky dome texture using R
    float u = -atan(R.y, R.x) / (2.0 * 3.14159);
    float v = acos(R.z) / 3.14159;
    vec2 skyUV = vec2(u, v);

    // Sample the sky dome texture at the calculated UV
    return texture(skyDomeTexture, skyUV).rgb;
}

void main() {
    vec2 adjustedTexCoord;

    if(objectId == roomId)
    {
        adjustedTexCoord = (texCoord.yx  / 0.01f) -0.1f ;
    }
    else if( objectId == groundId)
    {
        adjustedTexCoord = (texCoord.xy  / 0.01f) -0.1f ;
    }
    else
    {
        adjustedTexCoord = texCoord.xy;
    }

    // Transform and normalize vectors
    vec3 T = normalize(tanVec);             // Tangent vector
    vec3 N = normalize(normalVec);          // Default normal vector
    vec3 B = normalize(cross(T, N));        // Bitangent vector
    mat3 TBN = mat3(T, B, N);               // TBN matrix

    // Calculate the sky reflection if the object is the sky
    if (objectId == skyId) {
        vec2 skyTexCoord = vec2(-atan(normalize(eyePos - worldPos).y, normalize(eyePos - worldPos).x) / (2.0 * 3.14159265),
                                acos(normalize(eyePos - worldPos).z) / 3.14159265);
        vec3 skyColor = texture(tex, skyTexCoord).rgb;
        FragColor = vec4(skyColor, 1.0);  // Output sky color with full opacity
        return;
    }

    // Adjust normal vector based on normal map if it exists
    if (useNormalMap) {
        // Sample the normal map and convert it from [0,1] to [-1,1]
        vec3 delta = texture(normalMap, adjustedTexCoord).xyz;
        delta = delta * 2.0 - vec3(1.0, 1.0, 1.0);

        // Transform the normal map's delta vector to world space
        N = normalize(TBN * delta);
    }

    // Light and view direction calculations
    vec3 L = normalize(lightVec - worldPos); // Light vector
    vec3 V = normalize(eyePos - worldPos);   // View vector
    vec3 H = normalize(L + V);               // Halfway vector

    vec3 Kd = diffuse;
    vec3 Ks = specular;

    // Sample the diffuse texture color
    vec3 texColor = texture(tex, adjustedTexCoord).rgb;
    if (length(texColor) > 0.001) {
        Kd *= texColor;  // Modulate diffuse color with the texture color if available
    }

    vec3 skyReflection = vec3(0.0, 0.0, 0.0);

    if(useSkyReflect)
    {
        skyReflection = getSkyReflection(V, N);
    }

    // Lighting terms
    float NdotL = max(dot(N, L), 0.0);
    float NdotV = max(dot(N, V), 0.0);
    float NdotH = max(dot(N, H), 0.0);
    float VdotH = max(dot(V, H), 0.0);
    float LdotH = max(dot(L, H), 0.0);

    vec3 F = getF(LdotH, Ks);
    float G = getG(LdotH);
    float D = getD(N, H, shininess);

    vec3 BRDF_diffuse = (Kd / 3.14159);  
    vec3 BRDF = BRDF_diffuse + ((F * G * D) / (4.0));

    // Checkerboard pattern for ground, floor, and sea (optional)
    if (objectId == groundId || objectId == floorId || objectId == seaId) {
        ivec2 uv = ivec2(floor(100.0 * adjustedTexCoord));
        if ((uv[0] + uv[1]) % 2 == 0)
            Kd *= 0.9;
    }

    // Ambient and direct lighting contributions
    vec3 scene_ambient = ambientLight * Kd; 
    vec3 IiNdotL = lightIntensity * NdotL;

    vec3 finalColor = scene_ambient + IiNdotL * BRDF;

    FragColor.xyz = finalColor;
}
