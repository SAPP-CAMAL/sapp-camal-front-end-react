import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AccordionTrigger } from '@/components/ui/accordion';

interface Props {
	stepNumber: number;
	title: string;
	subTitle?: string;
	className?: string;
	isDisabled?: boolean;
	paragraphLines?: string[];
	isDisabledMessage?: string;
	variant?: 'success' | 'disabled' | 'default';
	onClick?: (e: React.MouseEvent) => void;
}

const defaultStyles = 'hover:no-underline px-4 hover:bg-gray-50 transition-colors border-b rounded-b-none';

export const BasicAnimalAdmissionAccordionHeader = ({
	stepNumber,
	title,
	subTitle,
	className = '',
	isDisabled = false,
	variant = 'default',
	paragraphLines = [],
	isDisabledMessage,
	onClick,
}: Props) => {
	const handleShowDisabledMessage = () => {
		if (isDisabled && isDisabledMessage) toast.error(isDisabledMessage);
	};

	return (
		<div onClick={handleShowDisabledMessage}>
			<AccordionTrigger
				className={cn(defaultStyles, (isDisabled || variant === 'disabled') && 'opacity-50', className)}
				disabled={isDisabled}
				onClick={onClick}
			>
				<div className={'flex items-center gap-4'}>
					{variant === 'success' ? (
						<div className='w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors bg-primary text-white'>
							<Check />
						</div>
					) : (
						<div className='w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors'>{stepNumber}</div>
					)}

					<div>
						<h3 className='text-lg font-medium flex items-center gap-3'>
							{title} {subTitle && <span className='text-xs text-gray-400 ml-2'>{subTitle}</span>}
						</h3>

						<div className='text-sm text-muted-foreground mt-1'>
							{paragraphLines.map((line, index) => (
								<p key={index} className='font-normal'>
									{line}
								</p>
							))}
						</div>
					</div>
				</div>
			</AccordionTrigger>
		</div>
	);
};
