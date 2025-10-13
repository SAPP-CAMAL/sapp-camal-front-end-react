import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VideoValidationResult } from '@/lib/read-video-metadata';
import { UploadCloud, CheckCircle2, X, Video as VideoIcon, Play, FilePlay, Pause, XIcon, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

export interface VideoItem extends VideoValidationResult {}

interface Props {
	open: boolean;
	title: string;
	canSaveItems?: boolean;
	canDeleteItems?: boolean;
	videoList: VideoItem[];
	limitVideosToUpload?: number;
	maxDurationPerVideo?: number;
	onSave: () => void;
	onRemove: (videoItem: VideoItem) => void;
	onOpenChange: (open: boolean) => void;
	onAddVideos: (videos: FileList) => void;
}

export function VideoUploadDialog({
	open,
	title,
	videoList,
	canSaveItems,
	canDeleteItems,
	limitVideosToUpload = 2,
	maxDurationPerVideo = 20,
	onSave,
	onRemove,
	onAddVideos,
	onOpenChange,
}: Props) {
	const [selectedVideo, setSelectedVideo] = useState<VideoItem>();

	const handleOpenChange = (open: boolean) => {
		if (!open) setSelectedVideo(undefined);
		onOpenChange(open);
	};

	const handleRemove = (videoItem: VideoItem) => {
		onRemove(videoItem);
		setSelectedVideo(undefined);
	};

	const handleFiles = (files: FileList | null) => {
		if (!canSaveItems || !files) return;

		const existingNormalized = new Set(videoList.map(v => v.name));
		let invalidFile: File | null = null;

		for (const file of Array.from(files)) {
			const newName = file.name.trim().replace(/\s+/g, '_');

			if (!existingNormalized.has(newName)) continue;

			invalidFile = file;
			toast.error(`Ya se ha subido el video con el nombre "${newName}"`);
		}

		if (invalidFile) return;

		onAddVideos(files);
	};

	const validItems = videoList.filter(v => v.valid.isValid);
	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className='sm:max-w-[520px]'>
				<DialogHeader>
					<DialogTitle>
						<span className='inline-flex items-center gap-2'>
							<span className='relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-50 text-emerald-600'>
								<VideoIcon className='' />
								{/* <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-emerald-500 rounded-full border border-white" /> */}
							</span>
							{title}
						</span>
					</DialogTitle>
					<DialogDescription>
						Máximo {limitVideosToUpload} videos por corral. Duración máxima: {maxDurationPerVideo} segundos cada uno.
					</DialogDescription>
				</DialogHeader>

				{videoList.length < limitVideosToUpload && !selectedVideo && <DragAndDropArea onAddVideos={handleFiles} canSaveItems={canDeleteItems} />}

				{/* Play video */}
				{selectedVideo && (
					<video key={selectedVideo.url} controls className='w-full max-h-60 mt-3 rounded-md bg-black' muted autoPlay>
						<source src={selectedVideo.url} type={selectedVideo.contentType} />
						Tu navegador no soporta la reproducción de videos.
					</video>
				)}

				<div className='flex items-center justify-between mt-3'>
					<Badge variant='secondary' className='bg-gray-100 text-gray-700'>
						{`${validItems.length}/${limitVideosToUpload} videos válidos`}
					</Badge>
					<Badge className='bg-emerald-100 text-emerald-700'>Listo para guardar</Badge>
				</div>

				{/* Selected videos */}
				{videoList.length > 0 && (
					<div className='mt-3'>
						<p className='text-sm font-medium mb-2'>Videos seleccionados:</p>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-auto pr-1'>
							{videoList.map(videoItem => (
								<VideoLoaded
									key={videoItem.url}
									videoItem={videoItem}
									onRemove={handleRemove}
									onSelect={setSelectedVideo}
									canDeleteItems={canDeleteItems}
									isSelected={selectedVideo?.url === videoItem.url}
									onRemoveSelected={() => setSelectedVideo(undefined)}
								/>
							))}
						</div>
					</div>
				)}

				{/* Cancel and save button */}
				<DialogFooter className='mt-3'>
					<Button variant='outline' onClick={() => handleOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={onSave} className='bg-emerald-600 hover:bg-emerald-700 text-white' disabled={!canSaveItems}>
						{`Guardar Videos (${validItems.length})`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

const DragAndDropArea = ({ onAddVideos, canSaveItems }: Pick<Props, 'onAddVideos' | 'canSaveItems'>) => (
	<div
		onDrop={e => {
			e.preventDefault();
			if (canSaveItems) e.dataTransfer.files && onAddVideos(e.dataTransfer.files);
		}}
		onDragOver={e => e.preventDefault()}
		className='mt-2 border-3 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center text-center'
	>
		<UploadCloud className='h-8 w-8 text-gray-400 mb-2' />
		<p className='text-sm text-gray-600'>Arrastra videos aquí o haz clic para seleccionar</p>
		<p className='text-xs text-gray-500 mt-1'>MP4, MOV, AVI - Máximo 50MB por archivo</p>
		<input
			type='file'
			accept='video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm'
			multiple
			className='hidden'
			id='video-file-input-shared'
			onChange={e => e.target.files && canSaveItems && onAddVideos(e.target.files)}
		/>
		<Button
			variant='outline'
			size='sm'
			className='mt-3 text-teal-600 border-teal-600 bg-white hover:bg-teal-600 hover:text-white'
			onClick={() => document.getElementById('video-file-input-shared')?.click()}
			disabled={!canSaveItems}
		>
			<FilePlay className='h-4 w-4' />
			Seleccionar Videos
		</Button>
	</div>
);

const VideoLoaded = ({
	videoItem,
	isSelected,
	canDeleteItems,
	onSelect,
	onRemove,
	onRemoveSelected,
}: {
	videoItem: VideoItem;
	isSelected?: boolean;
	canDeleteItems?: boolean;
	onSelect: (videoItem: VideoItem) => void;
	onRemove: (videoItem: VideoItem) => void;
	onRemoveSelected: (videoItem: VideoItem) => void;
}) => (
	<div className={`relative rounded-lg border p-3 ${videoItem.valid ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/50'}`}>
		<ConfirmationDialog
			title='¿Está seguro que desea eliminar este video?'
			description='Esta acción eliminará el video seleccionado y no se podrá recuperar.'
			onConfirm={() => {
				if (!canDeleteItems) return toast.error('No se pueden eliminar el video.');
				onRemove(videoItem);
			}}
			triggerBtn={
				<button type='button' className='absolute top-2 right-2 text-gray-500 hover:text-red-600' aria-label='Eliminar'>
					<X className='h-4 w-4' />
				</button>
			}
			cancelBtn={
				<Button variant='outline' size='lg'>
					<XIcon />
					Cancelar
				</Button>
			}
			confirmBtn={
				<Button variant='ghost' className='bg-emerald-600 hover:bg-emerald-600 hover:text-white text-white' size='lg'>
					<Check />
					Si
				</Button>
			}
		/>

		<div className='text-xs font-medium text-gray-800 pr-6 truncate' title={videoItem.name}>
			{videoItem.name}
		</div>

		<div className='text-[11px] text-gray-600 mb-2'>{`${Math.round(videoItem.duration)}s · ${videoItem.sizeMB} MB`}</div>

		{/* preview with play overlay */}
		<div className='relative aspect-video w-full overflow-hidden rounded-md bg-black'>
			<video src={videoItem.url} className='h-full w-full object-cover' muted />

			{isSelected ? (
				<div className='absolute inset-0 flex items-center justify-center' onClick={() => onRemoveSelected(videoItem)}>
					<span className='inline-flex items-center justify-center h-9 w-9 rounded-full bg-black/50 text-white'>
						<Pause className='h-4 w-4' />
					</span>
				</div>
			) : (
				<div className='absolute inset-0 flex items-center justify-center' onClick={() => onSelect(videoItem)}>
					<span className='inline-flex items-center justify-center h-9 w-9 rounded-full bg-black/50 text-white'>
						<Play className='h-4 w-4' />
					</span>
				</div>
			)}
		</div>

		{/* validity */}
		<div className='mt-2 text-[11px]'>
			{videoItem.valid.isValid ? (
				<span className='inline-flex items-center gap-1 text-emerald-700'>
					<CheckCircle2 className='h-3 w-3' /> Video válido
				</span>
			) : (
				<span className='inline-flex items-center gap-1 text-red-700'>
					<X className='h-3 w-3' /> {videoItem.valid.reason || 'Inválido'}
				</span>
			)}
		</div>
	</div>
);
