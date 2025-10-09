import { CreateDetailRegisterVehicle } from './create-detail-register-vehicle';

export interface UpdateDetailRegisterVehicle extends CreateDetailRegisterVehicle {}

export interface UpdateDetailRegisterVehicleResponse extends UpdateDetailRegisterVehicle {
	id: number;
	idRegisterVehicle: number;
	userUpdated: number;
	updatedAt: string;
}
