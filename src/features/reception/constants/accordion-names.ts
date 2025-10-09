import { AccordionStepKeys } from '../context/reception-provider';

export const ACCORDION_NAMES: Record<'STEP_1' | 'STEP_2' | 'STEP_3', AccordionStepKeys> = {
	STEP_1: 'step1Accordion',
	STEP_2: 'step2Accordion',
	STEP_3: 'step3Accordion',
} as const;
