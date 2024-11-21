/////////////////////////////////////////////////////////////////////////
// Pixel shader for lighting
/////////////////////////////////////////////////////////////////////////
#version 330

out vec4 FragColor;

// Object IDs corresponding to scene objects
const int nullId = 0;
const int skyId = 1;
const int seaId = 2;
const int groundId = 3;
const int roomId = 4;
const int boxId = 5;
const int frameId = 6;
const int lPicId = 7;
const int rPicId = 8;
const int teapotId = 9;
const int spheresId = 10;
const int floorId = 11;
const float PI = 3.14159265;

in vec3 normalVec;
in vec3 lightVec;
in vec3 worldPos;
in vec2 texCoord;
in vec3 eyePos;
in vec3 tanVec;
in vec4 shadowCoord; // Added: Shadow coordinates from vertex shader

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

// Added: Shadow map sampler
uniform sampler2D shadowMap;

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
    vec3 reflectDir = reflect(viewDir, normal);
    float u = -atan(reflectDir.y, reflectDir.x) / (2.0 * 3.14159);
    float v = acos(reflectDir.z) / 3.14159;
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
        vec3 delta = texture(normalMap, texCoords).xyz * 2.0 - vec3(1.0);
        N = normalize(delta.x * T + delta.y * B + delta.z * N);
    }
    return N;
}

// Apply texture color based on object ID
vec3 applyTextureColor(vec3 Kd, vec2 texCoords) 
{
    vec3 texColor = texture(tex, texCoords).rgb;
    if (length(texColor) > 0.001) Kd *= texColor;

    if (objectId == lPicId && (texCoords.x >= 0.98 || texCoords.y >= 0.98 || texCoords.x <= 0.02 || texCoords.y <= 0.02))
        Kd = vec3(0.5);

    if (objectId == rPicId) 
    {
        float stripeWidth = 0.1;
        float stripe = mod(floor(texCoords.x / stripeWidth), 2.0);
        Kd = stripe == 0.0 ? vec3(0.0) : vec3(1.0);
    }
    return Kd;
}

// Apply checkerboard pattern for ground, floor, and sea objects
vec3 applyCheckerboardPattern(vec3 Kd, vec2 texCoords) 
{
    if (objectId == groundId || objectId == floorId || objectId == seaId) 
    {
        ivec2 uv = ivec2(floor(100.0 * texCoords));
        if ((uv[0] + uv[1]) % 2 == 0)
            Kd *= 0.9;
    }
    return Kd;
}

// Shadow factor calculation
bool IsInShadow(vec4 shadowCoord)
{
    // Transform shadow coordinates to texture space
    vec2 shadowIndex = shadowCoord.xy / shadowCoord.w;

    // Ensure the fragment is within the shadow map bounds
    if (shadowIndex.x < 0.0 || shadowIndex.x > 1.0 ||
        shadowIndex.y < 0.0 || shadowIndex.y > 1.0 || shadowCoord.w <= 0.0)
    {
        return false;
    }

    // Sample shadow map depth
    float lightDepth = texture(shadowMap, shadowIndex.xy).w;
    float pixelDepth = shadowCoord.w;
    float bias = 0.005f; 

    return pixelDepth > lightDepth + bias;
}

// Main function for lighting calculations
void main() 
{
 vec2 uv = gl_FragCoord.xy/vec2(750,750); // (or whatever screen size)
 FragColor.xyz = vec3(texture(shadowMap, uv).w/100.0);  // or similar
 return;  // which disables all further code in the shader

    vec3 Kd = diffuse;
    vec3 Ks = specular;

    // Adjust texture coordinates
    vec2 adjustedTexCoord = adjustTexCoord();

    // Calculate tangent, normal, and bitangent vectors
    vec3 T = normalize(tanVec);
    vec3 N = normalize(normalVec);
    vec3 B = normalize(cross(T, N));
    mat3 TBN = mat3(T, B, N);

    // Calculate sky reflection for sky object
    if (objectId == skyId) 
    {
        vec2 skyTexCoord = vec2(-atan(normalize(eyePos - worldPos).y, normalize(eyePos - worldPos).x) / (2.0 * PI),
                                acos(normalize(eyePos - worldPos).z) / PI);
        vec3 skyColor = texture(tex, skyTexCoord).rgb;
        FragColor = vec4(skyColor, 1.0);
        return;
    }

    // Apply normal mapping if enabled
    N = applyNormalMap(N, T, B, adjustedTexCoord);

    // Calculate light and view directions
    vec3 L = normalize(lightVec - worldPos);
    vec3 V = normalize(eyePos - worldPos);
    vec3 H = normalize(L + V);

    // Sample texture color
    Kd = applyTextureColor(Kd, adjustedTexCoord);

    // Calculate optional sky reflection
    vec3 skyReflection = useSkyReflect ? computeSkyReflection(V, N) : vec3(0.0);



    // Lighting terms
    float NdotL = max(dot(N, L), 0.0);
    float LdotH = max(dot(L, H), 0.0);
    vec3 F = computeFresnel(LdotH, Ks);
    float G = computeGeometric(LdotH);
    float D = computeDistribution(N, H, shininess);

    // BRDF (Bidirectional Reflectance Distribution Function) components
    vec3 BRDF_diffuse = (Kd / PI);
    vec3 BRDF = BRDF_diffuse + (F * G * D) / 4.0;

    // Apply checkerboard pattern if applicable
    Kd = applyCheckerboardPattern(Kd, adjustedTexCoord);

    // Final color calculation: ambient + direct lighting + optional sky reflection
    vec3 sceneAmbient = ambientLight * Kd;
    vec3 directLight = lightIntensity * NdotL;
    vec3 finalColor = sceneAmbient + directLight * BRDF;

    // Calculate shadow factor
    bool inShadow = IsInShadow(shadowCoord);

    if(inShadow)
    {
        FragColor.xyz = sceneAmbient;
    }
    else
    {
        FragColor.xyz = finalColor + skyReflection;
    }

}