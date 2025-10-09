import { http } from '@/lib/ky';
import { StatusCorrals } from '@/features/corral/domain';
import { CommonHttpResponse, CreateOrUpdateHttpResponse } from '@/features/people/domain';

export const getStatusCorralsByDate = (admissionDate: string) => {
	return http
		.get('v1/1.0.0/status-corrals/by-admission-date', {
			searchParams: { admissionDate },
		})
		.json<CommonHttpResponse<StatusCorrals>>();
};

export const saveStatusCorralVideoById = (statusCorralId: string | number, specieLine: string, videoFile: File) => {
	const formData = new FormData();
	formData.append('file', videoFile);
	formData.append('specieLine', specieLine);

	return http
		.post(`v1/1.0.0/status-corrals/upload-video/${statusCorralId.toString()}`, {
			body: formData,
		})
		.json<CreateOrUpdateHttpResponse<StatusCorrals>>();
};

export const removeStatusCorralVideoById = (statusCorralId: string | number, fullFilePath: string) => {
	return http
		.delete(`v1/1.0.0/status-corrals/delete-video/${statusCorralId.toString()}`, {
			json: { fullFilePath },
		})
		// .json<CreateOrUpdateHttpResponse<StatusCorrals>>();
};
