/**
 * Extrae el mensaje de error de una respuesta de API
 * Prioriza el campo 'data' sobre 'message' ya que 'data' contiene
 * el mensaje específico del backend mientras que 'message' es genérico
 * 
 * @param error - Error capturado en un bloque catch
 * @returns Mensaje de error extraído o null si no se puede parsear
 */
export async function getApiErrorMessage(error: any): Promise<string | null> {
  try {
    if (!error?.response?.json) return null;
    
    const errorResponse = await error.response.json();
    
    // Priorizar 'data' sobre 'message'
    return errorResponse.data || errorResponse.message || null;
  } catch {
    return null;
  }
}

/**
 * Extrae el mensaje de error y el código de estado de una respuesta de API
 * 
 * @param error - Error capturado en un bloque catch
 * @returns Objeto con data, message y statusCode
 */
export async function getApiErrorDetails(error: any): Promise<{
  data: string | null;
  message: string | null;
  statusCode: number | null;
}> {
  try {
    if (!error?.response?.json) {
      return { data: null, message: null, statusCode: null };
    }
    
    const errorResponse = await error.response.json();
    
    return {
      data: errorResponse.data || null,
      message: errorResponse.message || null,
      statusCode: errorResponse.statusCode || error.response.status || null,
    };
  } catch {
    return { data: null, message: null, statusCode: null };
  }
}
