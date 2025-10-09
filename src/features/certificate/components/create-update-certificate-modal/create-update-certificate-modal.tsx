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
			<DialogContent className='min-w-xl max-h-[95vh] overflow-y-auto'>
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

						<div className='flex gap-2'>
							<Button type='submit' className='flex-1' disabled={form.formState.isSubmitting}>
								<Save />
								{btnMessage}
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
