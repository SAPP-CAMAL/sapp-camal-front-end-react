import { http } from "@/lib/ky";

/**
 * Sube un archivo (PDF o imagen) para un certificado
 * @param certificateId - ID del certificado
 * @param file - Archivo a subir
 */
export async function uploadCertificateFileService(
  certificateId: number,
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post(
    `v1/1.0.0/certificate/upload-file/${certificateId}`,
    {
      body: formData,
    }
  );

  return response.json();
}

/**
 * Elimina el archivo asociado a un certificado
 * @param certificateId - ID del certificado
 */
export async function deleteCertificateFileService(
  certificateId: number
): Promise<any> {
  const response = await http.delete(
    `v1/1.0.0/certificate/delete-file/${certificateId}`
  );

  return response.json();
}
