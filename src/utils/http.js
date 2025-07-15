import Axios from "axios";
import {hideLoading, showLoading} from "../store/storeLoading";
import {isFunction, parseJwt} from "./helpers";
import {doLogout} from "./AppUtil";
import {useUserStore} from "../store/storeUser";
import {AuthApi} from "../apis/Auth.api";

const getState = useUserStore.getState;
const BASE_URL = process.env.VITE_URL_SERVER;
export const axios = Axios.create({
    baseURL: BASE_URL,
    // timeout: 300000,
    // // withCredentials: true,
    // headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    // },
});
axios.interceptors.request.use(function (config) {
    const {data} = getState();
    // console.log(data?.jwtToken)
    if (data?.jwtToken) {
        config.headers.authorization = `Bearer ${data?.jwtToken}`;
        config.headers["Access-Control-Allow-Origin"] = "*";
        config.headers["Access-Control-Allow-Methods"] = "DELETE, POST, GET, OPTIONS";
        config.headers["Access-Control-Allow-Headers"] = "Origin, Content-Type, Authorization, X-Requested-With, Accept";
        config.headers["Access-Control-Allow-Credentials"] = "true";
        config.headers.userCode = data?.userCode;
        config.headers.userId = data?.userId;
    }
    return config;
});

let isRefreshing = false;
let failedApis = [];


axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const {data, addUserInfo} = getState();
        if (error.response.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;

  const { data, addUserInfo } = getState();

  // ✅ THÊM ĐOẠN KIỂM TRA refreshToken
  if (!data?.refreshToken || !data?.userCode) {
    console.warn("❌ Không có refreshToken hoặc userCode → không thể refresh → logout");
    doLogout();
    return Promise.reject(error);
  }

  try {
    if (!isRefreshing) {
      isRefreshing = true;
      failedApis.push(originalRequest);

      const response = await AuthApi.refresh({
        refreshToken: data.refreshToken,
        userCode: data.userCode,
      });

      console.log(response);
      if (response?.body?.refreshToken) {
        const dataToken = parseJwt(response?.body?.accessToken);
        addUserInfo({
          jwtToken: response?.body?.accessToken,
          refreshToken: response?.body?.refreshToken,
          ...dataToken,
        });

        originalRequest.headers.Authorization = `Bearer ${response?.body?.accessToken}`;
        isRefreshing = false;

        const retryFailedApis = failedApis.map((api) => axios(api));
        await Promise.all(retryFailedApis);
        failedApis = [];
        return axios(originalRequest);
      } else {
        console.error("❌ Refresh token không hợp lệ hoặc đã hết hạn");
        doLogout();
        return Promise.reject(error);
      }
    } else {
      failedApis.push(originalRequest);
      return Promise.resolve({ data: "Refresh token is being refreshed..." });
    }
  } catch (error) {
    console.error("❌ Lỗi khi gọi API refresh:", error);
    doLogout();
    isRefreshing = false;
    return Promise.reject(error);
  }
}

    }
)

function handleHttpError(err) {
    return err?.response?.data || err.error || err;
}

function makeHttpRequest(apiCall, successCallBack, failCallBack, transformFunc) {
    showLoading();
    return new Promise(async () => {
        try {
            const response = await apiCall();
            hideLoading();
            const responseData = response.data;
            const successResponse = isFunction(transformFunc) ? transformFunc(responseData) : responseData;
            successCallBack(successResponse);
        } catch (error) {
            hideLoading();
            if (isFunction(failCallBack)) {
                failCallBack(handleHttpError(error));
            }
        }
    });
}

function makeHttpRequestNoLoading(apiCall, successCallBack, failCallBack, transformFunc) {
    return new Promise(async () => {
        try {
            const response = await apiCall();
            const responseData = response.data;
            const successResponse = isFunction(transformFunc) ? transformFunc(responseData) : responseData;
            successCallBack(successResponse);
        } catch (error) {
            if (isFunction(failCallBack)) {
                failCallBack(handleHttpError(error));
            }
        }
    });
}

export async function get(url, params = {}) {
    const isHideLoading = params.progress === false;
    delete params.progress;
    if (!isHideLoading) showLoading();
    const responseData = await axios.get(url, {params});
    if (!isHideLoading) hideLoading();
    return responseData.data;
}

export async function post(url, data, config = {}) {
  const isHideLoading = data.progress === false;
  delete data.progress;

  if (!isHideLoading) showLoading();

  try {
    const response = await axios.post(url, data, config);
    return response.data;
  } catch (error) {
    throw error; 
  } finally {
    if (!isHideLoading) hideLoading(); 
  }
}


export function getRequest(url, params = {}, ...rest) {
    return convertRequest(params, () => axios.get(url, {params}), ...rest);
}

export function postRequest(url, data, config = {}, ...rest) {
    return convertRequest(data, () => axios.post(url, data, config), ...rest);
}

export function putRequest(url, data, config = {}, ...rest) {
    return convertRequest(data, () => axios.put(url, data, config), ...rest);
}

export function deleteRequest(url, data, config = {}, ...rest) {
    return convertRequest(data, () => axios.delete(url, data, config), ...rest);
}

function convertRequest(data, ...rest) {
    const isHideLoading = data.progress === false;
    delete data.progress;
    if (isHideLoading) {
        makeHttpRequestNoLoading(...rest);
    } else {
        makeHttpRequest(...rest);
    }
}

function handleLogout() {
    // AppNotification.error('Login session expired, please log in again.');
    doLogout();
}
