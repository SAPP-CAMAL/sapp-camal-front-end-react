export interface EquipmentType {
  id: number;
  description: string;
  status: boolean;
}

export interface EquipmentHygieneItem {
  idSettingHygiene: number;
  id: number;
  idEquipmentType: number;
  description: string;
  status: boolean;
  equipmentType: EquipmentType;
}

export interface CommonHttpResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type EquipmentHygieneResponse = CommonHttpResponse<EquipmentHygieneItem[]>;

export interface GroupedEquipmentHygiene {
  equipmentTypeId: number;
  equipmentTypeDescription: string;
  items: EquipmentHygieneItem[];
}