export const clearReceptionStorage = () => {
  try {
    const receptionKeys = [
      'animalAdmissions',
      'animalTransport',
      'species',
    ];
    receptionKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing reception storage:', error);
  }
};
