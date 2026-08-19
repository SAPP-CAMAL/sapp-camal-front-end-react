"use client";

import { useState } from "react";
import { LayersIcon } from "lucide-react";
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
import { ReportSectionsManagement } from "../report-sections-management";
import { ReportTemplateAdmin } from "../domain/report-template-admin.domain";

export function ManageReportSections({ reportTemplate }: { reportTemplate: ReportTemplateAdmin }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <LayersIcon />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
                    Gestionar secciones de la plantilla
                </TooltipContent>
            </Tooltip>
            <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
                <DialogHeader>
                    <DialogTitle>Secciones de la plantilla {reportTemplate.name}</DialogTitle>
                    <DialogDescription>Crea y edita las secciones de esta plantilla.</DialogDescription>
                </DialogHeader>
                {open && (
                    <div className="min-w-0 w-full">
                        <ReportSectionsManagement fixedTemplateId={reportTemplate.id} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
