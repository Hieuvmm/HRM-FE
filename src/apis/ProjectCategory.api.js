import {endpoints} from "utils/common";
import {post} from "utils/http";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {AppNotification} from "../components/Notification/AppNotification";

const URL_LIST = endpoints.projectCategory.PATH_LIST_PROJECT_CATEGORY
export const ProjectCategoryApi = {
    useGetProjectCategories: function (data, options) {
        return useQuery({
            queryKey: [URL_LIST, data],
            queryFn: async () => {
                const res = await post(URL_LIST, data);
                return res?.body || []
            },
            placeholderData: [],
            ...options
        })
    },
    create: function (data) {
        const URL = endpoints.projectCategory.PATH_CREATE_PROJECT_CATEGORY;
        return post(URL, data);
    },
    detail: function (data) {
        const URL = endpoints.projectCategory.PATH_DETAIL_PROJECT_CATEGORY;
        return post(URL, data);
    },
    update: function (data) {
        const URL = endpoints.projectCategory.PATH_UPDATE_PROJECT_CATEGORY;
        return post(URL, data);
    },

    delete: function (data) {
        const URL = endpoints.projectCategory.PATH_DELETE_PROJECT_CATEGORY;
        return post(URL, data);
    }
}
