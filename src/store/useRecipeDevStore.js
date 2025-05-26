// /src/store/useRecipeDevStore.js
import { create } from "zustand";

const useRecipeDevStore = create((set) => ({
  recipeDev: {},
  setField: (key, value) =>
    set((state) => ({
      recipeDev: {
        ...state.recipeDev,
        [key]: value,
      },
    })),
  overwriteRecipeDev: (newObj) => {
    console.log("🧠 [useRecipeDevStore] overwriteRecipeDev called with:", newObj);
    set({ recipeDev: { ...newObj } });
  },

  resetRecipeDev: () => set({ recipeDev: {} }),
}));

export default useRecipeDevStore;
