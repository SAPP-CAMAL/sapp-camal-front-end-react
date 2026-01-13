"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  uploadCertificateFileService,
  deleteCertificateFileService,
} from "../../server/db/certificate-file.service";
import { isToday, parseISO } from "date-fns";

interface CertificateFileManagerProps {
  certificateId: number;
  issueDate: string;
  fileUrl?: string | null;
  onFileChange?: () => void;
}

export function CertificateFileManager({
  certificateId,
  issueDate,
  fileUrl,
  onFileChange,
}: CertificateFileManagerProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Verificar si la fecha es hoy
  const isDateToday = issueDate ? isToday(parseISO(issueDate)) : false;
  const canEdit = isDateToday;

  // Detectar el tipo de archivo basándose en la extensión de la URL
  const getFileType = () => {
    if (!fileUrl) return null;
    
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    
    if (imageExtensions.includes(extension || '')) {
      return 'image';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    return 'unknown';
  };

  const fileType = getFileType();
  const isImage = fileType === 'image';
  const isPDF = fileType === 'pdf';

  // Obtener el nombre del archivo desde la URL
  const getFileName = () => {
    if (!fileUrl) return '';
    return fileUrl.split('/').pop() || 'archivo';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo (PDF o imágenes)
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Tipo de archivo no válido. Solo PDF o imágenes.");
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("El archivo es demasiado grande. Máximo 10MB.");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Por favor seleccione un archivo");
      return;
    }

    setIsUploading(true);
    try {
      await uploadCertificateFileService(certificateId, selectedFile);
      toast.success("Archivo subido exitosamente");
      setUploadDialogOpen(false);
      setSelectedFile(null);
      onFileChange?.();
    } catch (error: any) {
      console.error("Error al subir archivo:", error);
      toast.error(
        error?.message || "Error al subir el archivo. Intente nuevamente."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCertificateFileService(certificateId);
      toast.success("Archivo eliminado exitosamente");
      onFileChange?.();
    } catch (error: any) {
      console.error("Error al eliminar archivo:", error);
      toast.error(
        error?.message || "Error al eliminar el archivo. Intente nuevamente."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const renderFilePreview = () => {
    if (!fileUrl) return null;

    if (isImage) {
      return (
        <div className="relative w-24 h-24 mx-auto">
          <img
            src={fileUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-md border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(fileUrl, "_blank")}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div
          className="flex flex-col items-center justify-center w-24 h-24 mx-auto border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => window.open(fileUrl, "_blank")}
        >
          <FileText className="h-10 w-10 text-red-500 mb-1" />
          <p className="text-[10px] text-gray-600 text-center px-1 truncate w-full">
            PDF
          </p>
        </div>
      );
    }

    return (
      <div
        className="flex flex-col items-center justify-center w-24 h-24 mx-auto border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => window.open(fileUrl, "_blank")}
      >
        <FileText className="h-10 w-10 text-gray-500 mb-1" />
        <p className="text-[10px] text-gray-600 text-center px-1 truncate w-full">
          Archivo
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-1">
      {fileUrl ? (
        <>
          {/* Previsualización del archivo */}
          {renderFilePreview()}

          {/* Botones de acción */}
          {canEdit ? (
            <div className="flex items-center gap-1">
              {/* Botón Cambiar */}
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Upload className="mr-1 h-3 w-3" />
                    Cambiar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cambiar Guía</DialogTitle>
                    <DialogDescription>
                      Seleccione un nuevo archivo PDF o imagen para reemplazar
                      el actual.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Vista previa del archivo actual */}
                    <div className="space-y-2">
                      <Label>Archivo actual</Label>
                      {isImage ? (
                        <img
                          src={fileUrl}
                          alt="Current file"
                          className="w-full max-w-xs mx-auto rounded-lg border"
                        />
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">
                            {getFileName()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Selector de nuevo archivo */}
                    <div className="space-y-2">
                      <Label htmlFor="file">Nuevo archivo</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          Seleccionado: {selectedFile.name} (
                          {(selectedFile.size / 1024).toFixed(2)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setUploadDialogOpen(false);
                        setSelectedFile(null);
                      }}
                      disabled={isUploading}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Actualizar
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Botón Eliminar */}
              <ConfirmationDialog
                triggerBtn={
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="mr-1 h-3 w-3" />
                    Eliminar
                  </Button>
                }
                title="¿Eliminar archivo?"
                description="Esta acción eliminará permanentemente el archivo asociado a este certificado. Esta acción no se puede deshacer."
                cancelBtn={
                  <Button variant="outline" disabled={isDeleting}>
                    Cancelar
                  </Button>
                }
                confirmBtn={
                  <Button
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      "Eliminar"
                    )}
                  </Button>
                }
                onConfirm={handleDelete}
              />
            </div>
          ) : null}
        </>
      ) : canEdit ? (
        // Subir nuevo archivo
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Upload className="mr-1 h-3 w-3" />
              Subir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir Guía</DialogTitle>
              <DialogDescription>
                Seleccione un archivo PDF o imagen para el certificado.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Archivo</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Seleccionado: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formatos permitidos: PDF, JPG, PNG, WEBP. Tamaño máximo: 10MB
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  setSelectedFile(null);
                }}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      )}
    </div>
  );
}
