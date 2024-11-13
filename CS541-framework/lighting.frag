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

in vec3 normalVec;   
in vec3 lightVec;   
in vec3 worldPos;   
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

// Fresnel term calculation
vec3 computeFresnel(float LdotH, vec3 Ks) 
{
    return Ks + (1.0 - Ks) * pow(1.0 - LdotH, 5.0);
}

// Geometric term calculation
float computeGeometric(float LdotH) 
{
    float LH_pow_2 = max(pow(LdotH, 2), 0.00001);
    return 1.0 / LH_pow_2;
}

// Normal distribution term calculation
float computeDistribution(vec3 N, vec3 H, float shininess) 
{
    float term1 = (shininess + 2.0) / (2.0 * 3.14159);
    float term2 = pow(max(dot(N, H), 0.0), shininess);
    return term1 * term2;
}

// Sky reflection calculation
vec3 computeSkyReflection(vec3 viewDir, vec3 normal) 
{
    // Calculate reflection vector R
    vec3 reflectDir = reflect(viewDir, normal);

    // Calculate UV coordinates for the sky dome texture using R
    float u = -atan(reflectDir.y, reflectDir.x) / (2.0 * 3.14159);
    float v = acos(reflectDir.z) / 3.14159;

    //Sky dome texture at the calculated UV
    return texture(skyDomeTexture, vec2(u, v)).rgb;
}

// Adjust texture coordinates based on object ID
vec2 adjustTexCoord() 
{
    if (objectId == roomId)
        return texCoord.yx / 0.05;
    if (objectId == groundId || objectId == seaId)
        return texCoord.xy / 0.01;
    if (objectId == lPicId || objectId == rPicId)
        return (texCoord.xy - 0.1) / 0.8;
    return texCoord.xy;
}

// Sample and apply normal map if enabled
vec3 applyNormalMap(vec3 N, vec3 T, vec3 B, vec2 texCoords) 
{
    if (useNormalMap)
    {
        // Sample the normal map and convert it from [0,1] to [-1,1]
        vec3 delta = texture(normalMap, texCoords).xyz * 2.0 - vec3(1.0);
        // Transform the normal map's delta vector to world space
        N = normalize(delta.x * T + delta.y * B + delta.z * N);
    }
    return N;
}

void main() 
{
    vec3 Kd = diffuse;
    vec3 Ks = specular;

    vec2 adjustedTexCoord = adjustTexCoord();

    // Transform and normalize vectors
    vec3 T = normalize(tanVec);             // Tangent vector
    vec3 N = normalize(normalVec);          // Default normal vector
    vec3 B = normalize(cross(T, N));        // Bitangent vector
    mat3 TBN = mat3(T, B, N);               // TBN matrix

    // Calculate the sky reflection if the object is the sky
    if (objectId == skyId) 
    {
        vec2 skyTexCoord = vec2(-atan(normalize(eyePos - worldPos).y, normalize(eyePos - worldPos).x) / (2.0 * 3.14159265),
                                acos(normalize(eyePos - worldPos).z) / 3.14159265);
        vec3 skyColor = texture(tex, skyTexCoord).rgb;
        FragColor = vec4(skyColor, 1.0);  // Output sky color with full opacity
        return;
    }

    // Apply normal mapping if enabled
    N = applyNormalMap(N, T, B, adjustedTexCoord);

    // Light and view direction calculations
    vec3 L = normalize(lightVec - worldPos); // Light vector
    vec3 V = normalize(eyePos - worldPos);   // View vector
    vec3 H = normalize(L + V);               // Halfway vector

    // Sample the diffuse texture color
    vec3 texColor = texture(tex, adjustedTexCoord).rgb;
    if (length(texColor) > 0.001) 
    {
        Kd *= texColor;  // Modulate diffuse color with the texture color if available
    }

    //For the house pic
    if(objectId == lPicId)
    {
        if(adjustedTexCoord.x >= 0.98f ||adjustedTexCoord.y >= 0.98f 
         || adjustedTexCoord.x <= 0.02f || adjustedTexCoord.y <= 0.02f)
        {
            Kd = vec3(0.5f, 0.5f, 0.5f);
        }
    }

    if(objectId == rPicId)
    {
        float stripeWidth = 0.1f;

        float stripe = mod(floor(adjustedTexCoord.x / stripeWidth), 2.0);

        if(stripe == 0.0)
        {
            Kd = vec3(0.0f, 0.0f, 0.0f); // White color
        }
        else
        {
            Kd = vec3(1.0f, 1.0f, 1.0f); // Black color
        }
    }

    // Calculate optional sky reflection
    vec3 skyReflection = useSkyReflect ? computeSkyReflection(V, N) : vec3(0.0);

    // Lighting terms
    float NdotL = max(dot(N, L), 0.0);
    float NdotV = max(dot(N, V), 0.0);
    float NdotH = max(dot(N, H), 0.0);
    float VdotH = max(dot(V, H), 0.0);
    float LdotH = max(dot(L, H), 0.0);

    vec3 F = computeFresnel(LdotH, Ks);
    float G = computeGeometric(LdotH);
    float D = computeDistribution(N, H, shininess);

    vec3 BRDF_diffuse = (Kd / 3.14159);  
    vec3 BRDF = BRDF_diffuse + ((F * G * D) / (4.0));

    // Checkerboard pattern for ground, floor, and sea (optional)
    if (objectId == groundId || objectId == floorId || objectId == seaId) 
    {
        ivec2 uv = ivec2(floor(100.0 * adjustedTexCoord));
        if ((uv[0] + uv[1]) % 2 == 0)
            Kd *= 0.9;
    }

    // Ambient and direct lighting contributions
    vec3 scene_ambient = ambientLight * Kd; 
    vec3 IiNdotL = lightIntensity * NdotL;

    vec3 finalColor = scene_ambient + IiNdotL * BRDF;

    FragColor.xyz = finalColor + skyReflection;
}
