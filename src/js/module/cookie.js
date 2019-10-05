'use strict';

const attrSeparator = ';';
const keyValueSeparator = '=';

const expiresKey = 'expires';
const pathKey = 'path';

function get(key, defaultValue = null) {
	let name = key + keyValueSeparator,
		decodedCookieString = decodeURIComponent(document.cookie),
		cookies = decodedCookieString.split(';');

	for (let cookie of cookies) {
		cookie = cookie.trim();

		if (cookie.indexOf(name) === 0) {
			return cookie.substring(name.length, cookie.length);
		}
	}

	return defaultValue;
}

function set(key, value, expires = 365, path = '/') {
	let d = new Date();

	d.setTime(d.getTime() + expires * 24 * 60 * 60 * 1000);

	let cookieAttr = key + keyValueSeparator + value,
		expiresAttr = expiresKey + keyValueSeparator + d.toUTCString(),
		pathAttr = pathKey + keyValueSeparator + path;

	document.cookie = cookieAttr + attrSeparator + expiresAttr + attrSeparator + pathAttr;
}

module.exports = {
	get: get,
	set: set
};