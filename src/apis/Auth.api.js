import {endpoints} from "utils/common";
import {post} from "utils/http";

export const AuthApi = {
    login: function (data) {
        const URL = endpoints.auth.PATH_LOGIN;
        return post(URL, data);
    },
    logout: function (data) {
        const URL = endpoints.auth.PATH_LOGOUT;
        return post(URL, data);
    },
    refresh: function (data) {
        const URL = endpoints.auth.PATH_REFRESH;
        return post(URL, data);
    },
    getProfile: function () {
    const URL = endpoints.auth.PATH_PROFILE;
    return get(URL); 
  },
}
