import { useQuery } from '@tanstack/react-query';
import { CERTIFICATE_BY_CODE_TAG } from '../constants';
import { getCertificatesByCodeService } from '../server/db/certificate.service';

export const useCertificatesByCode = (code: string = '') => {
	const query = useQuery({
		queryKey: [CERTIFICATE_BY_CODE_TAG, 'list', code],
		queryFn: async () => {
			if (code.length < 1) return Promise.resolve({ data: [] });

			return getCertificatesByCodeService(code);
		},
	});

	return query;
};
