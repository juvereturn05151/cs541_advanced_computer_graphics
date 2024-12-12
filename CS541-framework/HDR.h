#pragma once

#ifndef _HDR
#define _HDR

#include<string>
#include "texture.h"

class HDR : public Texture
{
public:
    HDR();
    HDR(const std::string& filename);
};

#endif