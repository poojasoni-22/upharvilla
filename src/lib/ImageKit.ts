// src/lib/imagekit.ts

import ImageKit from "imagekit";

let _imagekit: ImageKit | null = null;

export function getImageKit(): ImageKit {
  if (!_imagekit) {
    _imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
    });
  }
  return _imagekit;
}

// Helper: build optimized URL for hero banners (1280x400)
export function getBannerUrl(filePath: string) {
  return `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${filePath}?tr=w-1280,h-400,f-auto,q-80,c-maintain_ratio`;
}

// Helper: build thumbnail URL (for admin preview)
export function getBannerThumbUrl(filePath: string) {
  return `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/${filePath}?tr=w-400,h-125,f-auto,q-70`;
}
