import { Step2Animals } from './step-2-animals';
import { Step3Transport } from './step-3-transport';
import { Accordion } from '@/components/ui/accordion';
import { Step1Certificate } from './step-1-certificate';
import { useReceptionContext } from '@/features/reception/hooks';

export const AnimalAdmissionSteps = () => {
	const { step1Accordion, step2Accordion, step3Accordion } = useReceptionContext();

	const openAccordions = [];

	if (step1Accordion.isOpen) openAccordions.push(step1Accordion.name);
	if (step2Accordion.isOpen) openAccordions.push(step2Accordion.name);
	if (step3Accordion.isOpen) openAccordions.push(step3Accordion.name);

	return (
		<Accordion className='space-y-4 border-b rounded-b-md' type='multiple' value={openAccordions}>
			{/* Step 1 */}
			<Step1Certificate />

			{/* Step 2 */}
			<Step2Animals />

			{/* Step 3 */}
			<Step3Transport />
		</Accordion>
	);
};
