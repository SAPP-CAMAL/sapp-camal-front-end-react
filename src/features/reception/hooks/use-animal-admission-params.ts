import { useEffect } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';

export const useAnimalAdmissionParams = () => {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      identification: parseAsString.withDefault(''),
      fullName: parseAsString.withDefault(''),
      plate: parseAsString.withDefault(''),
      certificateNumber: parseAsString.withDefault(''),
      introducerName: parseAsString.withDefault(''),
      introducerIdentification: parseAsString.withDefault(''),
      introducerBrand: parseAsString.withDefault(''),
    },
    { history: 'replace' } // Changed from 'push' to 'replace' to avoid polluting history
  );

  // Clear search parameters on component mount and unmount
  useEffect(() => {
    // Clear parameters on mount
    const clearParams = {
      identification: '',
      fullName: '',
      plate: '',
      certificateNumber: '',
      introducerName: '',
      introducerIdentification: '',
      introducerBrand: ''
    };
    
    setSearchParams(clearParams, { history: 'replace' });
    
    // Clear parameters on unmount
    return () => {
      setSearchParams(clearParams, { history: 'replace' });
    };
  }, [setSearchParams]);

	return {
		searchParams,
		setSearchParams,
	};
};
