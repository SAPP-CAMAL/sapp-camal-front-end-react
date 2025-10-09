import { useQuery } from '@tanstack/react-query';
import { CERTIFICATE_BY_CODE_TAG } from '../constants';
import { getCertificateByCodeService } from '../server/db/certificate.service';

export const useCertificateByCode = (code: string = '') => {
	const query = useQuery({
		queryKey: [CERTIFICATE_BY_CODE_TAG, code],
		queryFn: async () => {
			if (code.length < 1) return Promise.resolve({ data: undefined });

			return getCertificateByCodeService(code);
		},
	});

	return query;
};
