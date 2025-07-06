import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useQuery} from "@tanstack/react-query";

export const ExchangeRateApi = {
    useGetList: function (data, options) {
        const URL = endpoints.exchangeRate.PATH_LIST_EXCHANGE_RATE
        return useQuery({
            queryKey: [URL, data],
            queryFn: async () => {
                const res = await post(URL, data);
                return res?.body || []
            },
            placeholderData: [],
            ...options
        })
    },
    create: function (data) {
        const URL = endpoints.exchangeRate.PATH_CREATE_EXCHANGE_RATE;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.exchangeRate.PATH_DETAIL_EXCHANGE_RATE;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.exchangeRate.PATH_UPDATE_EXCHANGE_RATE;
        return post(URL, data);
    },
    delete: function (data) {
        const URL = endpoints.exchangeRate.PATH_DELETE_EXCHANGE_RATE;
        return post(URL, data);
    }
}
