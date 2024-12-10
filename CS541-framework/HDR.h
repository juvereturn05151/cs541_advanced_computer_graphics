#pragma once

#ifndef _HDR
#define _HDR

#include<string>

class HDR
{
public:
    unsigned int textureId;
    int width, height, depth;
    float* image;
    HDR();
    HDR(const std::string& filename);

    void BindTexture(const int unit, const int programId, const std::string& name);
    void UnbindTexture(const int unit);
};

#endif