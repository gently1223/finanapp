// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useRules = () => {
  const validEmail = (str: string) => {
    return (
      /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/.test(str) ||
      'Email incorrecto'
    );
  };
  return { validEmail };
};
