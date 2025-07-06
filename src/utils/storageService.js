import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const localService = {
    set: function (key, value) {
        localStorage.setItem(key, value);
    },

    get: function (key) {
        return localStorage.getItem(key) || null;
    },

    setObject: function (key, value) {
        if (!value) return;
        localStorage.setItem(key, JSON.stringify(value));
    },

    getObject: function (key) {
        return JSON.parse(localStorage.getItem(key)) || null;
    },

    remove: function (key) {
        localStorage.removeItem(key);
    },

    clear: function () {
        localStorage.clear();
    },
}

export const sessionService = {
    set: function (key, value) {
        sessionStorage.setItem(key, value);
    },

    get: function (key) {
        return sessionStorage.getItem(key) || null;
    },

    setObject: function (key, value) {
        if (!value) return;
        sessionStorage.setItem(key, JSON.stringify(value));
    },

    getObject: function (key) {
        return JSON.parse(sessionStorage.getItem(key)) || null;
    },

    remove: function (key) {
        sessionStorage.removeItem(key);
    },

    clear: function () {
        sessionStorage.clear();
    },
}

export const cookieService = {
    set: function (key, value, expireTime, rest = {}) { // expireTime(s)
        const expires = new Date();
        expires.setTime(expires.getTime() + expireTime * 1000);
        cookies.set(key, value, {path: '/', expires, ...rest});
    },

    get: function (key) {
        return cookies.get(key) || null;
    },

    setObject: function (key, value, expireTime, rest = {}) { // expireTime(s)
        if (!value) return;
        const expires = new Date();
        expires.setTime(expires.getTime() + expireTime * 1000);
        cookies.set(key, JSON.stringify(value), {path: '/', expires, ...rest});
    },

    getObject: function (key) {
        return JSON.parse(cookies.get(key)) || null;
    },

    remove: function (key) {
        cookies.remove(key);
    },
}
