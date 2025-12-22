import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { default as BaseDatePicker, DatePickerProps } from 'react-datepicker';

// React datepicker calendar styles
import 'react-datepicker/dist/react-datepicker.css';
import './react-datepicker-custom-styles.css';

const defaultInputStyle =
	'border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

type Props = DatePickerProps & {
	inputClassName?: string;
	iconClassName?: string;
};

export const DatePicker = ({
	dateFormat = "d 'de' MMMM yyyy",
	locale = es,
	showIcon = true,
	icon,
	placeholderText = 'Elija una fecha',
	timeCaption = 'Hora',
	inputClassName = '',
	iconClassName = '',
	...props
}: Props) => {
	return (
		<div>
			<BaseDatePicker
				dateFormat={dateFormat}
				locale={locale}
				showIcon={showIcon}
				icon={icon ?? <Calendar className={cn('mt-[1px]', iconClassName )} />}
				placeholderText={placeholderText}
				timeCaption={timeCaption}
				className={cn(defaultInputStyle, inputClassName)}
				{...props}
			/>
		</div>
	);
};
