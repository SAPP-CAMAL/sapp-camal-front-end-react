
export interface VisitorLogFilterBody {
    page?: number;
    limit?: number;
    registerDate: string;
    identification?: string;
    fullName?: string;
    idCompany?: number;
}

export interface CreateVisitorLogBody {
    idPerson: number,
    idCompany: number,
    visitPurpose: string,
    entryTime?: string,
    exitTime?: string
    observation?: string,
    status: boolean
    hasVehicle?: boolean
}

export type UpdateVisitorLogBody = Partial<CreateVisitorLogBody>;

export interface VisitorLogFilterResponse {
    id: number;
    visitPurpose: string;
    entryTime: string;
    exitTime: string;
    observation: string;
    idPerson: number;
    idCompany: number;
    status: boolean;
    person: Person;
    company: Company;
}

interface Company {
    id: number;
    ruc: string;
    name: string;
    companyType: CompanyType;
}

interface CompanyType {
    id: number;
    name: string;
}

interface Person {
    id: number;
    identification: string;
    fullName: string;
    mobileNumber: string;
}


export interface VisitorCompany {
    id: number;
    idCompanyType: number;
    ruc: string;
    name: string;
    phone: null | string;
    email: null | string;
    address: null | string;
    status: boolean;
}


export interface RCompanyType {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

export interface CreateCompanyBody {
  ruc: string;
  name: string;
  idCompanyType: number;
  phone: string;
  email: string;
  address: string;
  status: boolean;
}
