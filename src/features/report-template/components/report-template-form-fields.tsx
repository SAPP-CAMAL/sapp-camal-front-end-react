"use client";

import { FileTextIcon, TriangleAlertIcon } from "lucide-react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RequiredMark } from "@/components/ui/required-mark";
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
import { useQuery } from "@tanstack/react-query";
import { getReportCodesAllActiveService } from "../server/db/report-template-admin.service";
import { REPORT_TYPES } from "../domain/report-template-admin.domain";
import { NewReportTemplateForm } from "./new-report-template";

export function NewReportTemplateFields({ showStatus = false }: { showStatus?: boolean }) {
    const form = useFormContext<NewReportTemplateForm>();
    const codesQuery = useQuery({
        queryKey: ["report-codes", "all-active"],
        queryFn: getReportCodesAllActiveService,
    });

    const availableCodes = codesQuery.data?.data ?? [];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <FileTextIcon /> Plantilla de Reporte
                    </CardTitle>
                    <CardDescription>Define la información general de la plantilla exportable.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-4 items-start">
                    <FormField
                        control={form.control}
                        name="idCode"
                        rules={{ required: { value: true, message: "El código es requerido" } }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Código <RequiredMark /></FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value ? String(field.value) : undefined}
                                    disabled={!availableCodes.length}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={availableCodes.length ? "Seleccione un código" : "No hay códigos disponibles"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {availableCodes.map((code) => (
                                            <SelectItem key={code.id} value={String(code.id)}>{code.code}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                {!availableCodes.length && !codesQuery.isLoading && (
                                    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm">
                                        <TriangleAlertIcon className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span>No hay códigos activos disponibles.</span>
                                    </div>
                                )}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        rules={{ required: { value: true, message: "El tipo es requerido" } }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo <RequiredMark /></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccione un tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {REPORT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="name"
                        rules={{ required: { value: true, message: "El nombre es requerido" } }}
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Nombre <RequiredMark /></FormLabel>
                                <FormControl>
                                    <Input maxLength={100} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {showStatus && (
                        <FormField
                            control={form.control}
                            name="status"
                            rules={{ required: { value: true, message: "El estado es requerido" } }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado <RequiredMark /></FormLabel>
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
