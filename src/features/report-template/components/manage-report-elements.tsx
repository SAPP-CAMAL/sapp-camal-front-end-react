"use client";

import { useState } from "react";
import { PuzzleIcon } from "lucide-react";
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
import { ReportElementsManagement } from "../report-elements-management";
import { ReportSectionAdmin } from "../domain/report-template-admin.domain";

export function ManageReportElements({ reportSection }: { reportSection: ReportSectionAdmin }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <PuzzleIcon />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
                    Gestionar elementos de la sección
                </TooltipContent>
            </Tooltip>
            <DialogContent className="max-h-screen overflow-y-auto overflow-x-hidden w-[95vw] sm:max-w-[90vw] lg:max-w-[75vw]">
                <DialogHeader>
                    <DialogTitle>Elementos de la sección {reportSection.sectionName}</DialogTitle>
                    <DialogDescription>Crea y edita los elementos de esta sección.</DialogDescription>
                </DialogHeader>
                {open && (
                    <div className="min-w-0 w-full">
                        <ReportElementsManagement fixedSectionId={reportSection.id} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
