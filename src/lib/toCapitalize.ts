export const toCapitalize = (text: string, allWord: boolean = false) => {
	if (typeof text !== 'string') return '';

	if (!allWord) {
		const lower = text.toLowerCase();
		return lower.charAt(0).toUpperCase() + lower.slice(1);
	}

	return text
		.split(' ')
		.map(word => (word.length > 1 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()))
		.join(' ');
};
