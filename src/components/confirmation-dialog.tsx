import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface Props {
	triggerBtn: React.ReactNode;
	cancelBtn: React.ReactNode;
	confirmBtn: React.ReactNode;
	title: string;
	description?: string;
	onConfirm?: () => void;
}

export const ConfirmationDialog = ({ triggerBtn, cancelBtn, confirmBtn, description, title, onConfirm }: Props) => {
	return (
		<Dialog>
			<DialogTrigger asChild>{triggerBtn}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description ?? ''}</DialogDescription>
				</DialogHeader>

				<div className='flex justify-end items-center gap-2'>
					<DialogClose asChild>{cancelBtn}</DialogClose>
					<DialogClose asChild>
						<div onClick={() => onConfirm?.()}>{confirmBtn}</div>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
};
