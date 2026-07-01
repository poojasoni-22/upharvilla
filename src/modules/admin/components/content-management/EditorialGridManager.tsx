"use client";

import { upload } from "@imagekit/next";
import { useMutation, useQuery } from "convex/react";
import { Edit2, Image as ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressGalleryImage } from "@/lib/image-compress";
import { prewarmImageKitCache } from "@/lib/imagekit-url";
import { api } from "../../../../../convex/_generated/api";

export function EditorialGridManager() {
  const [isEditingSlot, setIsEditingSlot] = useState<number | null>(null);
  const [slotData, setSlotData] = useState({
    image: "",
    altText: "",
    visitLink: "",
    label: "",
  });
  const [slotFile, setSlotFile] = useState<File | null>(null);
  const slotInputRef = useRef<HTMLInputElement>(null);
  const [isSlotUploading, setIsSlotUploading] = useState(false);

  const gridData = useQuery(api.editorial.getEditorialGrid);
  const updateGrid = useMutation(api.editorial.updateEditorialGrid);

  const authenticator = async () => {
    const response = await fetch("/api/imagekit/auth");
    if (!response.ok) throw new Error("Auth failed");
    return await response.json();
  };

  const handleUpdateSlot = async () => {
    if (!isEditingSlot) return;

    const promise = async () => {
      setIsSlotUploading(true);
      try {
        let imageUrl = slotData.image;

        if (slotFile) {
          const authParams = await authenticator();
          const compressedFile = await compressGalleryImage(slotFile);
          const uploadResponse = await upload({
            file: compressedFile,
            fileName: `editorial_slot_${isEditingSlot}_${Date.now()}`,
            tags: ["editorial", `slot${isEditingSlot}`],
            useUniqueFileName: true,
            folder: "/editorial",
            ...authParams,
          });
          if (!uploadResponse.url) throw new Error("Upload failed");
          imageUrl = uploadResponse.url;
          prewarmImageKitCache(imageUrl);
        }

        if (!imageUrl) throw new Error("Image is required");

        const currentGrid = gridData || {
          slot1: { image: "", altText: "" },
          slot2: { image: "", altText: "" },
          slot3: { image: "", altText: "" },
          slot4: { image: "", altText: "" },
          slot5: { image: "", altText: "" },
        };

        const updatedGrid = {
          ...currentGrid,
          [`slot${isEditingSlot}`]: {
            image: imageUrl,
            altText: slotData.altText,
            visitLink: slotData.visitLink,
            label: slotData.label,
          },
        };

        // Remove system fields
        delete (updatedGrid as any)._id;
        delete (updatedGrid as any)._creationTime;
        delete (updatedGrid as any).createdAt;

        await updateGrid(updatedGrid as any);

        setIsEditingSlot(null);
        setSlotFile(null);
        setSlotData({ image: "", altText: "", visitLink: "", label: "" });
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setIsSlotUploading(false);
      }
    };

    toast.promise(promise(), {
      loading: "Updating slot...",
      success: "Slot updated!",
      error: "Failed to update slot",
    });
  };

  const openSlotEditor = (slotNum: number, data: any) => {
    setIsEditingSlot(slotNum);
    setSlotData({
      image: data?.image || "",
      altText: data?.altText || "",
      visitLink: data?.visitLink || "",
      label: data?.label || "",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-primary" />
        Editorial Grid (5 Slots)
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((num) => {
          const slot = (gridData as any)?.[`slot${num}`];
          return (
            <Card
              key={num}
              className="overflow-hidden group relative border-primary/5 hover:border-primary/20 transition-all"
            >
              <div className="aspect-[3/4] bg-muted relative">
                {slot?.image ? (
                  <img
                    src={slot.image}
                    className="object-cover w-full h-full"
                    alt=""
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-[10px] h-7 gap-1"
                    onClick={() => openSlotEditor(num, slot)}
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit Slot {num}
                  </Button>
                </div>
              </div>
              <div className="p-2 bg-background/80 backdrop-blur-sm absolute bottom-0 left-0 right-0 border-t border-primary/5">
                <p className="text-[10px] font-semibold truncate uppercase tracking-tighter">
                  {slot?.label || `Slot ${num}`}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={isEditingSlot !== null}
        onOpenChange={(open) => !open && setIsEditingSlot(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Slot {isEditingSlot}</DialogTitle>
            <DialogDescription className="text-xs">
              {isEditingSlot === 1 || isEditingSlot === 5
                ? "Recommended layout size: 600 × 900 px (2:3 Portrait ratio)."
                : isEditingSlot === 2
                  ? "Recommended layout size: 800 × 400 px (2:1 Wide ratio)."
                  : "Recommended layout size: 600 × 600 px (1:1 Square ratio)."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px]">Label</Label>
                <Input
                  className="h-8 text-xs"
                  value={slotData.label}
                  onChange={(e) =>
                    setSlotData({ ...slotData, label: e.target.value })
                  }
                  placeholder="e.g. SHOP NECKLACES"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Alt Text</Label>
                <Input
                  className="h-8 text-xs"
                  value={slotData.altText}
                  onChange={(e) =>
                    setSlotData({ ...slotData, altText: e.target.value })
                  }
                  placeholder="SEO Description"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Link</Label>
              <Input
                className="h-8 text-xs"
                value={slotData.visitLink}
                onChange={(e) =>
                  setSlotData({ ...slotData, visitLink: e.target.value })
                }
                placeholder="/category/..."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Upload New Image</Label>
              <div
                onClick={() => slotInputRef.current?.click()}
                className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  ref={slotInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && setSlotFile(e.target.files[0])
                  }
                />
                {slotFile ? (
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    {slotFile.name}
                  </span>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <UploadCloud className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      Click to replace
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">
                      Recommended:{" "}
                      {isEditingSlot === 1 || isEditingSlot === 5
                        ? "600×900 px (2:3)"
                        : isEditingSlot === 2
                          ? "800×400 px (2:1)"
                          : "600×600 px (1:1)"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateSlot}
              disabled={isSlotUploading || (!slotFile && !slotData.image)}
              className="w-full h-8 text-xs"
            >
              {isSlotUploading && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Update Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
