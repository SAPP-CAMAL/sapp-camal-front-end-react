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
import { NewDisinfectantCatalogFields } from "./disinfectant-catalog-form-fields";
import { updateDisinfectantCatalogService } from "../server/db/disinfectant-catalog.service";
import { NewDisinfectantCatalogForm } from "./new-disinfectant-catalog";
import { DisinfectantCatalog } from "../domain/disinfectant-catalog.domain";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateDisinfectantCatalog({ disinfectant }: { disinfectant: DisinfectantCatalog }) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);

    const form = useForm<NewDisinfectantCatalogForm>();

    useEffect(() => {
        if (open) {
            form.reset({
                name: disinfectant.name,
                description: disinfectant.description ?? "",
                status: String(disinfectant.status),
            });
        }
    }, [open, form, disinfectant]);

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            await updateDisinfectantCatalogService(disinfectant.id, {
                ...(form.formState.dirtyFields.name && { name: data.name }),
                ...(form.formState.dirtyFields.description && { description: data.description }),
                ...(form.formState.dirtyFields.status && { status: data.status === "true" }),
            });

            form.reset(form.formState.defaultValues);

            await queryClient.invalidateQueries({ queryKey: ["disinfectants-catalog"] });

            toast.success("Desinfectante actualizado exitosamente");
        } catch (error) {
            if (error instanceof HTTPError) {
                const { data } = await error.response.json<{ data: string }>();
                toast.error(data);
            } else {
                toast.error("No se pudo actualizar el desinfectante");
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
                    Editar Desinfectante
                </TooltipContent>
            </Tooltip>
            <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
                <DialogHeader>
                    <DialogTitle>Editar Desinfectante</DialogTitle>
                    <DialogDescription>Modifica la información del desinfectante seleccionado.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-8 grid grid-cols-1 gap-2">
                        <NewDisinfectantCatalogFields showStatus />
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
