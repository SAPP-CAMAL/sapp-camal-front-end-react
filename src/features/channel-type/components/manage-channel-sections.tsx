"use client";

import { LayoutGridIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChannelSectionsManagement } from "@/features/config-section-channel/channel-sections-management";
import { ChannelType } from "../domain/channel-type.domain";

export function ManageChannelSections({ channelType }: { channelType: ChannelType }) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant={"outline"}>
              <LayoutGridIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Gestionar Secciones
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
        <DialogHeader>
          <DialogTitle>
            Secciones del Tipo de Canal: {channelType.name}
          </DialogTitle>
          <DialogDescription>
            Administra las secciones internas configuradas para este tipo de
            canal (cantidad de ganchos configurados: {channelType.hooksQuantity}).
          </DialogDescription>
        </DialogHeader>
        <ChannelSectionsManagement idChannelType={channelType.id} />
      </DialogContent>
    </Dialog>
  );
}
