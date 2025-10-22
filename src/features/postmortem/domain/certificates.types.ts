/**
 * Tipos para certificados y marcas
 */

export type Person = {
  id: number;
  identification: string;
  fullName: string;
};

export type User = {
  id: number;
  person: Person;
};

export type Introducer = {
  id: number;
  user: User;
};

export type Brand = {
  id: number;
  name: string;
  introducer: Introducer;
};

export type Certificate = {
  id: number;
  code: string;
};

export type CorralType = {
  id: number;
  code: string; // "NOR" o "EME"
};

export type CertificateBrand = {
  id: number;
  idBrands: number;
  idCertificate: number;
  codes: string;
  status: boolean;
  commentary: string;
  males: number;
  females: number;
  slaughterDate: string;
  idSpecies: number;
  idStatusCorrals: number;
  idCorralType: number;
  idFinishType: number | null;
  idCorralGroup: number;
  brand: Brand;
  certificate: Certificate;
  corralType: CorralType;
};

export type GetCertificatesResponse = {
  code: number;
  message: string;
  data: CertificateBrand[];
};

export type GetCertificatesRequest = {
  slaughterDate: string; // formato: YYYY-MM-DD
  idSpecies: number;
  type?: "NOR" | "EME"; // Opcional, si no se envía trae todos
};

export type CorralTypeFilter = "TODOS" | "NORMAL" | "EMERGENCIA";
