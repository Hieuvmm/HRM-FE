import {create} from 'zustand';
import {storageKey} from "../utils/common";
import {persist} from 'zustand/middleware';

const initialState = {
    authorized: false,
    changedPass: "NO",
    data: {},
}

export const useUserStore = create(
    persist(
        (set) => ({
            ...initialState,
            addUserInfo: (newData) => {
                set({
                    data: newData,
                    authorized: true,
                });
            },
            removeUserInfo: () => {
                set({
                    authorized: false,
                    data: {},
                });
            },
        }),
        {
            name: storageKey.USER_INFO,
            getStorage: () => sessionStorage,
        }
    )
);

export function removeUserInfo() {
    useUserStore.setState({
        authorized: false,
        data: {},
    });
}
