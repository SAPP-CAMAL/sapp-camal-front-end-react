'use client'

export interface VideoValidationResult {
	url: string;
	name: string;
	duration: number;
	sizeMB: number;
	width?: number;
	height?: number;
	contentType: string;
	valid: { isValid: boolean; reason?: string };
}

type URLMetadata = Omit<VideoValidationResult, 'valid'>;

type AllowedVideoTypes = 'video/mp4' | 'video/quicktime' | 'video/x-msvideo' | 'video/x-matroska' | 'video/webm';

interface VideoMetadataOptions {
	maxMB?: number;
	maxSeconds?: number;
	allowedTypes?: AllowedVideoTypes[];
}

const DEFAULT_OPTIONS: Required<VideoMetadataOptions> = {
	maxMB: 50,
	maxSeconds: 20,
	allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
};

/**
 * Reads video metadata from a File object or URL string. Validates against provided options.
 *
 * @param fileOrUrl - The video File object or URL string.
 * @param options - Validation options including maxMB, maxSeconds, and allowedTypes.
 * @returns A promise that resolves to a VideoValidationResult object.
 */
export const readVideoFileMetadata = async (fileOrUrl: File | string, options: VideoMetadataOptions = {}): Promise<VideoValidationResult> => {
	const { maxMB, maxSeconds, allowedTypes } = { ...DEFAULT_OPTIONS, ...options };

	let metadata: URLMetadata;

	if (typeof fileOrUrl === 'string') metadata = await readUrlMetadata(fileOrUrl);
	else {
		const url = URL.createObjectURL(fileOrUrl);
		const sizeMB = fileOrUrl.size / (1024 * 1024);
		metadata = await readUrlMetadata(url);
		metadata.name = fileOrUrl.name;
		metadata.sizeMB = +sizeMB.toFixed(1);
	}

	// Now validate the metadata
	if (!allowedTypes.includes(metadata.contentType as AllowedVideoTypes)) {
		const reason = 'Tipo de video no permitido, las extensiones permitidas son: ' + allowedTypes.join(', ') + '.';
		return { ...metadata, valid: { isValid: false, reason } };
	}

	if (metadata.duration > maxSeconds) {
		const reason = `La duración máxima permitida es de ${maxSeconds} segundos.`;
		return { ...metadata, valid: { isValid: false, reason } };
	}

	if (metadata.sizeMB > maxMB) {
		const reason = `El tamaño máximo permitido es de ${maxMB} MB.`;
		return { ...metadata, valid: { isValid: false, reason } };
	}

	return { ...metadata, valid: { isValid: true } };
};

/***
 * Reads metadata for multiple video files or URLs concurrently.
 *
 * @param files - An array or FileList of video File objects or URL strings.
 * @param options - Validation options including maxMB, maxSeconds, and allowedTypes.
 * @returns A promise that resolves to an array of VideoValidationResult objects.
 */
export const readMultipleVideoFiles = (
	files: FileList | File[],
	options: VideoMetadataOptions = {}
): Promise<(VideoValidationResult & { file: File })[]> => {
	const fileArray = Array.from(files);
	const promises = fileArray.map(file => readVideoFileMetadata(file, options).then(result => ({ ...result, file })));
	return Promise.all(promises);
};

export const cleanupVideoUrls = (videos: { url: string }[]) =>
	videos.forEach(video => {
		if (!video.url) return;

		URL.revokeObjectURL(video.url);
	});

const readUrlMetadata = async (url: string): Promise<URLMetadata> => {
	if (!url.startsWith('http') && !url.startsWith('blob:')) throw new Error('URL must start with http or blob:');

	const response = await fetch(url);

	if (!response.ok) throw new Error('Failed to fetch video headers');

	let sizeMB = 0;
	const contentType = response.headers.get('content-type') ?? 'unknown';

	const contentLength = response.headers.get('content-length') ?? '0';
	if (contentLength) sizeMB = parseInt(contentLength, 10) / (1024 * 1024);

	sizeMB = +sizeMB.toFixed(1);

	const today = new Date();
	let name = 'video-' + `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

	if (url.startsWith('http')) {
		const urlObj = new URL(url);
		name = urlObj.pathname.split('/').pop() ?? name;
	}

	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		video.src = url;

		video.onloadedmetadata = () => {
			resolve({
				url,
				sizeMB,
				contentType,
				name,
				duration: video.duration,
				width: video.videoWidth,
				height: video.videoHeight,
			});

			video.removeAttribute('src');
			video.load();
		};

		video.onerror = () => {
			reject('Error while loading video metadata from URL');
		};
	});
};
