import { Save } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Introducer } from '../domain';
import { useIntroducerModal } from '../hooks';

interface Props {
	triggerButton: React.ReactNode;
	introducerData?: Partial<Introducer & { brandId: number }>;
	onSetIntroducer?: (introducer?: Introducer & { brandId?: number }) => void;
}

export const IntroducerModal = ({ triggerButton, introducerData = {}, onSetIntroducer }: Props) => {
	const { form } = useIntroducerModal({ introducerData, onSetIntroducer });

	return (
		<Dialog open={form.watch('open')} onOpenChange={open => form.setValue('open', open)}>
			<DialogTrigger asChild>{triggerButton}</DialogTrigger>
			<DialogContent className='min-w-xl max-h-[95vh] overflow-y-auto'>
				<DialogHeader>
					{/* <DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription> */}
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={e => {
							e.preventDefault();
							e.stopPropagation();
							// form.handleSubmit(handleSaveOrUpdateShipper)(e);
						}}
						className='flex flex-col gap-4'
					>
						{/* <ShipperFields /> */}

						<div className='flex gap-2'>
							<Button type='submit' className='flex-1' disabled={form.formState.isSubmitting}>
								<Save />
								{/* {btnMessage} */}
							</Button>
							<Button type='button' variant='outline' disabled={form.formState.isSubmitting} onClick={() => form.setValue('open', false)}>
								Cancelar
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
