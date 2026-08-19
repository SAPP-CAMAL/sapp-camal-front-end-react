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
import { NewReportTemplateFields } from "./report-template-form-fields";
import { updateReportTemplateService } from "../server/db/report-template-admin.service";
import { NewReportTemplateForm } from "./new-report-template";
import { ReportTemplateAdmin } from "../domain/report-template-admin.domain";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateReportTemplate({ reportTemplate }: { reportTemplate: ReportTemplateAdmin }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const form = useForm<NewReportTemplateForm>();

    useEffect(() => {
        if (open) {
            form.reset({
                idCode: reportTemplate.idCode,
                name: reportTemplate.name,
                description: reportTemplate.description ?? "",
                type: reportTemplate.type,
                status: String(reportTemplate.status),
            });
        }
    }, [open, form, reportTemplate]);

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            await updateReportTemplateService(reportTemplate.id, {
                ...(form.formState.dirtyFields.idCode && { idCode: data.idCode }),
                ...(form.formState.dirtyFields.name && { name: data.name }),
                ...(form.formState.dirtyFields.description && { description: data.description }),
                ...(form.formState.dirtyFields.type && { type: data.type }),
                ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
            });

            form.reset(form.formState.defaultValues);

            await queryClient.invalidateQueries({ queryKey: ["report-templates-admin"] });

            toast.success("Plantilla de reporte actualizada exitosamente");
        } catch (error) {
            if (error instanceof HTTPError) {
                const { data } = await error.response.json<{ data: string }>();
                toast.error(data);
            } else {
                toast.error("No se pudo actualizar la plantilla de reporte");
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
                    Editar Plantilla
                </TooltipContent>
            </Tooltip>
            <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
                <DialogHeader>
                    <DialogTitle>Editar Plantilla de Reporte</DialogTitle>
                    <DialogDescription>Modifica la información de la plantilla seleccionada.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
                        <NewReportTemplateFields showStatus />
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
