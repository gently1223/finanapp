const animals = [
  'icons/lion.png',
  'icons/panda.png',
  'icons/racoon.png',
  'icons/owl.png',
  'icons/hipo.png',
  'icons/fox.png',
];
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useAnimals = () => {
  const getAnimal = () => {
    const random = Math.floor(Math.random() * 6);
    return animals[random];
  };

  return { getAnimal };
};
