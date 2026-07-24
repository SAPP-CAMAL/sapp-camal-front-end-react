"use client";

import { useState } from "react";
import { HouseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CorralGroupDetailsManagement } from "@/features/corral-group/corral-group-details-management";
import { CorralGroupAdmin } from "../domain/corral-group-admin.domain";

export function ManageCorralGroupDetails({ corralGroup }: { corralGroup: CorralGroupAdmin }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline">
              <HouseIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Gestionar corrales del grupo
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[80vw] lg:max-w-[65vw]">
        <DialogHeader>
          <DialogTitle>Corrales del grupo {corralGroup.name}</DialogTitle>
          <DialogDescription>Agrega o quita corrales asignados a este grupo.</DialogDescription>
        </DialogHeader>
        {open && (
          <div className="min-w-0 w-full">
            <CorralGroupDetailsManagement fixedGroupId={corralGroup.id} lineId={corralGroup.idLine} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
