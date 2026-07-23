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
import { NewMenuFields } from "./menu-form-fields";
import { updateMenuService } from "../server/db/menus.service";
import { NewMenuForm } from "./new-menu";
import { MenuAdmin } from "../domain/menus.domain";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UpdateMenu({
  menu,
  fixedModuleId,
}: {
  menu: MenuAdmin;
  fixedModuleId?: number;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<NewMenuForm>();

  useEffect(() => {
    if (open) {
      form.reset({
        moduleId: menu.moduleId,
        parentId: menu.parentId,
        menuName: menu.menuName,
        icon: menu.icon ?? "",
        url: menu.url ?? "",
        sequence: menu.sequence,
      });
    }
  }, [open, form, menu]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateMenuService(menu.id, {
        ...(form.formState.dirtyFields.moduleId && { moduleId: data.moduleId }),
        ...(form.formState.dirtyFields.parentId && { parentId: data.parentId }),
        ...(form.formState.dirtyFields.menuName && { menuName: data.menuName }),
        ...(form.formState.dirtyFields.icon && { icon: data.icon }),
        ...(form.formState.dirtyFields.url && { url: data.url }),
        ...(form.formState.dirtyFields.sequence && { sequence: data.sequence }),
      });

      form.reset(form.formState.defaultValues);

      await queryClient.invalidateQueries({
        queryKey: ["menus-admin"],
      });

      toast.success("Menú actualizado exitosamente");
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
        <TooltipContent side="top" align="center" sideOffset={5} avoidCollisions>
          Editar Menú
        </TooltipContent>
      </Tooltip>
      <DialogContent className="max-h-screen overflow-y-auto min-w-[60vw]">
        <DialogHeader>
          <DialogTitle>Editar Menú</DialogTitle>
          <DialogDescription>
            Modifica la información del ítem de menú seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className="space-y-8 grid grid-cols-1 gap-2"
          >
            <NewMenuFields excludeMenuId={menu.id} fixedModuleId={fixedModuleId} />
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
