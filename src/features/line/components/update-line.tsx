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
import { NewLineFields } from "./line-form-fields";
import { updateLineService } from "../server/db/line-admin.service";
import { NewLineForm } from "./new-line";
import { Line } from "../domain";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateLine({ line }: { line: Line }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const form = useForm<NewLineForm>();

    useEffect(() => {
        if (open) {
            form.reset({
                name: line.name,
                idSpecie: line.idSpecie ?? 0,
                description: line.description ?? "",
                status: String(line.status),
            });
        }
    }, [open, form, line]);

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            await updateLineService(line.id, {
                ...(form.formState.dirtyFields.name && { name: data.name }),
                ...(form.formState.dirtyFields.idSpecie && { idSpecie: data.idSpecie }),
                ...(form.formState.dirtyFields.description && { description: data.description }),
                ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
            });

            form.reset(form.formState.defaultValues);

            await queryClient.invalidateQueries({ queryKey: ["lines-admin"] });

            toast.success("Línea actualizada exitosamente");
        } catch (error) {
            if (error instanceof HTTPError) {
                const { data } = await error.response.json<{ data: string }>();
                toast.error(data);
            } else {
                toast.error("No se pudo actualizar la línea");
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
                    Editar Línea
                </TooltipContent>
            </Tooltip>
            <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
                <DialogHeader>
                    <DialogTitle>Editar Línea</DialogTitle>
                    <DialogDescription>Modifica la información de la línea seleccionada.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
                        <NewLineFields showStatus />
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
