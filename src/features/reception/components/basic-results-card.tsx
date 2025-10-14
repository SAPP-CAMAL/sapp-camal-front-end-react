import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
	className?: string;
	leftBlockClass?: string;
	isSelected?: boolean;
	title?: string;
	paragraph?: string;
	editButton?: React.ReactNode;
	onSelect?: (e: React.MouseEvent) => void;
	onRemove?: (e: React.MouseEvent) => void;
}

const defaultStyle = 'bg-gray-50 p-4 rounded-lg border';
const selectedStyle = 'hover:bg-gray-100 cursor-pointer transition-colors';

export const BasicResultsCard = ({
	className,
	onSelect,
	onRemove,
	leftBlockClass = 'flex flex-col gap-1',
	isSelected = false,
	title = '',
	paragraph = '',
	editButton,
}: Props) => {
	return (
		<div className={cn(defaultStyle, isSelected && selectedStyle, className)} onClick={onSelect}>
			<div className='flex items-center justify-between'>
				<div className={cn(leftBlockClass)}>
					{isSelected ? <Badge >{title}</Badge> : <p className='font-medium'>{title}</p>}
					<p className='text-sm text-gray-600'>{paragraph}</p>
				</div>

				{isSelected ? (
					<div className='flex gap-2'>
						{editButton}

						{onRemove && (
							<Button variant='outline' className='text-red-600 hover:text-red-600 hover:border-red-300' onClick={onRemove}>
								<X />
								Quitar
							</Button>
						)}
					</div>
				) : (
					editButton
				)}
			</div>
		</div>
	);
};
