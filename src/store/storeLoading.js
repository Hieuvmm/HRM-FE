import {create} from 'zustand';

export const useLoadingStore = create((set, get) => ({
    loading: 0,
    showLoading: () => set({loading: get().loading + 1}),
    hideLoading: () => set({loading: get().loading - 1}),
    resetLoading: () => set({loading: 0})
}));

export function showLoading() {
    const loading = useLoadingStore.getState().loading;
    useLoadingStore.setState({loading: loading + 1});
}

export function hideLoading() {
    const loading = useLoadingStore.getState().loading;
    const newLoading = loading === 0 ? 0 : loading - 1;
    useLoadingStore.setState({loading: newLoading});
}

export function resetLoading() {
    useLoadingStore.setState({loading: 0});
}
