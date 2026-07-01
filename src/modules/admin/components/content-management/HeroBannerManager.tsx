"use client";

import { upload } from "@imagekit/next";
import { useMutation, useQuery } from "convex/react";
import { ImageIcon, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressBannerImage } from "@/lib/image-compress";
import { prewarmImageKitCache } from "@/lib/imagekit-url";
import { api } from "../../../../../convex/_generated/api";

export function HeroBannerManager() {
  const [altText, setAltText] = useState("");
  const [visitLink, setVisitLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBanner = useMutation(api.heroBanners.createBanner);
  const deleteBanner = useMutation(api.heroBanners.deleteBanner);
  const banners = useQuery(api.heroBanners.getBanners);

  const authenticator = async () => {
    const response = await fetch("/api/imagekit/auth");
    if (!response.ok) throw new Error("Auth failed");
    return await response.json();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    const promise = async () => {
      setIsUploading(true);
      try {
        const authParams = await authenticator();
        const compressedFile = await compressBannerImage(selectedFile);

        const uploadResponse = await upload({
          file: compressedFile,
          fileName: `hero_banner_${Date.now()}`,
          tags: ["banner", "hero"],
          useUniqueFileName: true,
          folder: "/banners",
          ...authParams,
        });

        if (!uploadResponse.url) {
          throw new Error("No URL returned from ImageKit");
        }

        // Pre-warm optimized banner in the background
        prewarmImageKitCache(uploadResponse.url);

        await createBanner({
          imageLink: uploadResponse.url,
          altText: altText || "Advertisement Image",
          visitLink: visitLink || "#",
        });

        setAltText("");
        setVisitLink("");
        setSelectedFile(null);
        setIsOpen(false);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    };

    toast.promise(promise(), {
      loading: "Uploading banner...",
      success: "Banner added successfully!",
      error: (err) =>
        `Failed to upload: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  };

  const handleDelete = async (banner: any) => {
    const promise = async () => {
      try {
        // 1. Delete from database first
        await deleteBanner({ id: banner._id });

        // 2. Delete from ImageKit
        if (banner.imageLink) {
          const res = await fetch("/api/imagekit/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: banner.imageLink }),
          });
          if (!res.ok) {
            console.error("Failed to delete image from ImageKit");
          }
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    toast.promise(promise(), {
      loading: "Deleting banner...",
      success: "Banner deleted successfully!",
      error: "Failed to delete banner",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Hero Banners
        </h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Hero Banner</DialogTitle>
              <DialogDescription>
                Upload a new image for the homepage slider.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="altText" className="text-xs">
                  Alt Text
                </Label>
                <Input
                  id="altText"
                  placeholder="e.g. Summer Collection"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="visitLink" className="text-xs">
                  Redirect URL
                </Label>
                <Input
                  id="visitLink"
                  placeholder="https://..."
                  value={visitLink}
                  onChange={(e) => setVisitLink(e.target.value)}
                />
              </div>
              <div
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg overflow-hidden flex flex-col items-center justify-center gap-2 ${selectedFile ? "border-primary/30 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30 cursor-pointer"} transition-all`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && setSelectedFile(e.target.files[0])
                  }
                />
                {selectedFile ? (
                  <div className="w-full">
                    <div className="relative aspect-[21/9] w-full bg-muted">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="text-[10px] text-primary font-medium hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="text-[10px] text-destructive font-medium hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-8">
                    <UploadCloud className="h-8 w-8 text-muted-foreground/50" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Click to upload banner image
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      Recommended: 1600 × 800 px (2:1 ratio) to fit layout
                      perfectly
                    </span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="w-full"
              >
                {isUploading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners?.map((banner) => (
          <Card
            key={banner._id}
            className="overflow-hidden group hover:shadow-md transition-all border-primary/5 relative"
          >
            <div className="relative aspect-[21/9] overflow-hidden bg-muted">
              <img
                src={banner.imageLink}
                className="object-cover w-full h-full"
                alt={banner.altText}
              />

              {/* Always visible delete button at top right */}
              <div className="absolute top-2 right-2 z-10">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 shadow-md rounded-full bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95 transition-all"
                  onClick={() => handleDelete(banner)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium text-sm truncate">{banner.altText}</h3>
              <p className="text-[10px] text-muted-foreground truncate">
                {banner.visitLink}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
