import { reactive, toRefs } from 'vue';
//Not in used
export const useDynamicOrderList = <T>(items: T[]) => {
  const switchItems = (fromIndex: number, toIndex: number) => {
    // const toIndex = up ? index-- : index++;
    [items[fromIndex], items[toIndex]] = [items[toIndex], items[fromIndex]];
  };
  const removeItem = (index: number) => {
    items.splice(index, 1);
  };
  return { switchItems, removeItem };
};
