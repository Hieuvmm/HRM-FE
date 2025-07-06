import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

const initialState = {
    data: [],
};

export const useParameterStore = create(
    persist(
        (set) => ({
            ...initialState,
            addParameters: (newData) => {
                set({
                    data: newData,
                });
            },
            removeParameters: () => {
                set({
                    data: [],
                });
            },
        }),
        {
            name: 'parameter-cache', // Tên key trong localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);