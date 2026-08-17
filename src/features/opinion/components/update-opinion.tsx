"use client";

import { useEffect, useState } from "react";
import { SquarePenIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
import { OpinionFormFields } from "./opinion-form-fields";
import { updateOpinionService } from "../server/db/opinion.service";
import { NewOpinionForm } from "./new-opinion";
import { Opinion } from "../domain/opinion.domain";
import { OPINION_TAG } from "../constants/opinion.constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateOpinion({ opinion }: { opinion: Opinion }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewOpinionForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        name: opinion.name,
        code: opinion.code,
        status: String(opinion.status),
      });
    }
  }, [open, form, opinion]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateOpinionService(opinion.id, {
        ...(form.formState.dirtyFields.name && {
          name: data.name,
        }),
        ...(form.formState.dirtyFields.code && {
          code: data.code,
        }),
        ...(form.formState.dirtyFields.status && {
          status: data.status === "true",
        }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: [OPINION_TAG],
      });

      toast.success("Opinión actualizada exitosamente");
      setOpen(false);
    } catch (error: any) {
      const { data } = await error.response.json();
      toast.error(data);
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
        <TooltipContent
          side="top"
          align="center"
          sideOffset={5}
          avoidCollisions
        >
          Editar Opinión
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto w-[95vw] sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Opinión</DialogTitle>
          <DialogDescription>
            Modifica la información de la opinión seleccionada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <OpinionFormFields showStatus />
            <div className="flex justify-end col-span-2 gap-x-2">
              <Button
                type="button"
                variant={"outline"}
                disabled={form.formState.isSubmitting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || form.formState.isLoading
                }
              >
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
