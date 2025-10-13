import { http } from "@/lib/ky";
import { Specie, SpeciesResponse } from "@/features/list-animals/domain/specie.interface";

export async function getAllSpeciesService(): Promise<Specie[]> {
  try {
    const response = await http.get("v1/1.0.0/specie/all").json<SpeciesResponse>();
    
    if (response.code === 200) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener las especies');
  } catch (error) {
    console.error('Error en getAllSpeciesService:', error);
    throw error;
  }
}

export async function getSpecieByIdService(id: number): Promise<Specie | undefined> {
  try {
    const species = await getAllSpeciesService();
    return species.find(specie => specie.id === id);
  } catch (error) {
    console.error('Error en getSpecieByIdService:', error);
    throw error;
  }
}
