import { CommonHttpResponse } from "@/features/people/domain";

export type SettingSignsBody = {
    id: number;
    idBodyParts: number;
    idClinicalSigns: number;
    status: boolean;
    bodyParts?: {
        id: number;
        code: string;
        description: string;
    };
}

export type CreateSettingSignsBodyBody = {
    idBodyParts: number;
    idClinicalSigns: number;
}

export type ResponseSettingSignsBodyService = CommonHttpResponse<SettingSignsBody>
