"use client";

import { LayersIcon } from "lucide-react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { NewReportSectionForm } from "./new-report-section";

export function NewReportSectionFields({ showStatus = false }: { showStatus?: boolean }) {
    const form = useFormContext<NewReportSectionForm>();

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <LayersIcon /> Sección de la Plantilla
                    </CardTitle>
                    <CardDescription>Define el nombre y orden de la sección dentro de la plantilla.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
                    <FormField
                        control={form.control}
                        name="sectionName"
                        rules={{ required: { value: true, message: "El nombre es requerido" } }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre *</FormLabel>
                                <FormControl>
                                    <Input maxLength={50} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="orderIndex"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Orden</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {showStatus && (
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccione un estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Activo</SelectItem>
                                            <SelectItem value="false">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
