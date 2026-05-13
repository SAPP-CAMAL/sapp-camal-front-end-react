import { Save } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { CertificateFields } from './certificate-fields';
import { Certificate } from '@/features/certificate/domain';
import { useCertificateModal } from '@/features/certificate/hooks';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Props {
	triggerButton: React.ReactNode;
	certificate?: Partial<Certificate>;
	onSetCertificate?: (certificate?: Certificate) => void;
}

export const CreateUpdateCertificateModal = ({ triggerButton, certificate = {}, onSetCertificate }: Props) => {
	const { title, description, form, btnMessage, handleSaveOrUpdateCertificate } = useCertificateModal({ certificate, onSetCertificate });

	return (
		<Dialog open={form.watch('open')} onOpenChange={open => form.setValue('open', open)}>
			<DialogTrigger asChild>{triggerButton}</DialogTrigger>
			<DialogContent className='w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6'>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={e => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit(handleSaveOrUpdateCertificate)(e);
						}}
						className='flex flex-col gap-4'
					>
						<CertificateFields />

						<div className='flex flex-col sm:flex-row gap-2'>
							<Button type='submit' className='w-full sm:flex-1' disabled={form.formState.isSubmitting}>
								<Save />
								{btnMessage}
							</Button>
							<Button type='button' variant='outline' className='w-full sm:w-auto' disabled={form.formState.isSubmitting} onClick={() => form.setValue('open', false)}>
								Cancelar
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
