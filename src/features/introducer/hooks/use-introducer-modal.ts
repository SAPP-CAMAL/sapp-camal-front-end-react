import { useForm } from 'react-hook-form';
import { Introducer } from '../domain';

type IntroducerFormData = Introducer & { brandId: number; open: boolean };

const defaultValues: Partial<IntroducerFormData> = { open: false };

interface Props {
	introducerData?: Partial<IntroducerFormData>;
	onSetIntroducer?: (introducer?: IntroducerFormData) => void;
}

export const useIntroducerModal = ({ introducerData, onSetIntroducer }: Props) => {
	const form = useForm<IntroducerFormData>({ defaultValues: { ...defaultValues, ...introducerData, open: false } });

	return {
		// data
		form,
	};
};
