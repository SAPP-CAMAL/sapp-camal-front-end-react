import { parse, isValid } from 'date-fns';

const POSSIBLE_INPUT_FORMATS = ['dd-MM-yyyy', 'yyyy-MM-dd', 'MM-dd-yyyy'];

// const DESIRED_OUTPUT_FORMAT: string = 'dd-MM-yyyy'; // Example: 25-10-2025

/**
 * Attempts to parse a date string using multiple formats and returns it in the desired output format.
 * @param dateString The date string to format.
 * @returns The formatted date string or null if it couldn't be parsed.
 */
export const formatCertificateDate = (dateString: string) => {
	// 1. Parse using known formats
	for (const format of POSSIBLE_INPUT_FORMATS) {
		const parsedDate = parse(dateString, format, new Date());
		if (isValid(parsedDate)) return parsedDate;
	}

	try {
		// 2. Fallback to ISO parsing
		const isoDate = new Date(dateString);
		if (isValid(isoDate)) return isoDate;
	} catch (e) {}
};
