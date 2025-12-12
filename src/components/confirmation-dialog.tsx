import { useState } from 'react';
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
	const [isOpen, setIsOpen] = useState(false);
	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{triggerBtn}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description ?? ''}</DialogDescription>
				</DialogHeader>

				<div className='flex justify-end items-center gap-2'>
					<div onClick={() => setIsOpen(false)}>{cancelBtn}</div>

					<div
						onClick={() => {
							setIsOpen(false);
							onConfirm?.();
						}}
					>
						{confirmBtn}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
