"use client";

import {
  Eye,
  EyeOff,
  MoreHorizontal,
  Package,
  Settings2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProductActionMenuProps {
  productId: string;
  isActive: boolean;
  onOpenDetails: (id: string, editMode?: boolean) => void;
  onToggleActive: () => void;
  onDeleteClick: () => void;
  triggerClassName?: string;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  collisionPadding?: number;
}

export function ProductActionMenu({
  productId,
  isActive,
  onOpenDetails,
  onToggleActive,
  onDeleteClick,
  triggerClassName,
  align = "end",
  side = "bottom",
  sideOffset = 4,
  collisionPadding = 8,
}: ProductActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn(
            "h-6 w-6 rounded-md text-neutral-450 hover:text-neutral-700 hover:bg-neutral-100 transition-colors",
            triggerClassName,
          )}
        >
          <MoreHorizontal size={14} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className="w-44 rounded-xl shadow-xl border-muted/50"
      >
        <DropdownMenuItem
          onClick={() => onOpenDetails(productId, false)}
          className="gap-2 focus:bg-primary/5 cursor-pointer text-xs py-2"
        >
          <Package className="w-3.5 h-3.5" /> View Details
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onOpenDetails(productId, true)}
          className="gap-2 focus:bg-primary/5 cursor-pointer text-xs py-2"
        >
          <Settings2 className="w-3.5 h-3.5" /> Edit Details
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onToggleActive}
          className="gap-2 focus:bg-primary/5 cursor-pointer text-xs py-2"
        >
          {isActive ? (
            <>
              <EyeOff className="w-3.5 h-3.5" /> Deactivate
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" /> Activate
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-neutral-100 h-px" />

        <DropdownMenuItem
          variant="destructive"
          onClick={onDeleteClick}
          className="gap-2 focus:bg-red-500/10 text-red-650 cursor-pointer text-xs font-semibold py-2"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Product
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
