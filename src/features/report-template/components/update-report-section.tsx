"use client";

import { useEffect, useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { NewReportSectionFields } from "./report-section-form-fields";
import { updateReportSectionService } from "../server/db/report-template-admin.service";
import { NewReportSectionForm } from "./new-report-section";
import { ReportSectionAdmin } from "../domain/report-template-admin.domain";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateReportSection({ reportSection }: { reportSection: ReportSectionAdmin }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const form = useForm<NewReportSectionForm>();

    useEffect(() => {
        if (open) {
            form.reset({
                sectionName: reportSection.sectionName,
                orderIndex: reportSection.orderIndex,
                status: String(reportSection.status),
            });
        }
    }, [open, form, reportSection]);

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            await updateReportSectionService(reportSection.id, {
                ...(form.formState.dirtyFields.sectionName && { sectionName: data.sectionName }),
                ...(form.formState.dirtyFields.orderIndex && { orderIndex: data.orderIndex }),
                ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
            });

            form.reset(form.formState.defaultValues);

            await queryClient.invalidateQueries({ queryKey: ["report-sections-admin", reportSection.idTemplate] });

            toast.success("Sección actualizada exitosamente");
        } catch (error) {
            if (error instanceof HTTPError) {
                const { data } = await error.response.json<{ data: string }>();
                toast.error(data);
            } else {
                toast.error("No se pudo actualizar la sección");
            }
        }
    });

    return (
        <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant={"outline"}>
                            <SquarePenIcon />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
                    Editar Sección
                </TooltipContent>
            </Tooltip>
            <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
                <DialogHeader>
                    <DialogTitle>Editar Sección</DialogTitle>
                    <DialogDescription>Modifica la información de la sección seleccionada.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
                        <NewReportSectionFields showStatus />
                        <div className="flex justify-end col-span-2 gap-x-2">
                            <Button
                                type="button"
                                variant={"outline"}
                                disabled={form.formState.isSubmitting}
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting || form.formState.isLoading}>
                                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
