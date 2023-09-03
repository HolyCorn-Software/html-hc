//© HolyCorn Software 2020

import watchToCSS from './watch-to-css.mjs';

//We are importing this module if it exists, so that we can have automatic error management
setTimeout(() => import('../../../errors/error.mjs').catch(e => {

}), 200); //If possible
/**
 * @returns {htmlhc.lib.widget.ExtendedHTML}
 */
document.$$ = HTMLElement.prototype.$$ = function (e) {
	/* Implement ancestor query 
	E.g 'a %.button% img'
	This works by querring every a, then for each a, associate a parent .button, then for every .button, associate an image
	The reason this algorithm works in recursive situations e.g %.button% %div% img is because each time, only part of the string is queried
	*/
	let trim = /^(.+) $/.exec(e)
	e = trim ? trim[1] : e; //Trim the characters just before the end (just in case)
	let ancesReg = /([^'"]*.*) *%(.+)% *(.*)/;
	if (ancesReg.test(e)) {
		let [, beforeQ, parentQ, afterQ] = ancesReg.exec(e); //Before query, parent Query after Query, after Query.
		let temp = (this.$$(beforeQ).length ? [...this.$$(beforeQ)] : this == document ? [] : [this]).map(x => x.ancestor(parentQ)).filter(x => typeof x != 'undefined').map(x => afterQ ? x.$$(afterQ) : x);
		let final = []
		temp.forEach(x => { try { [...x].forEach(x => final.push(x)) } catch (e) { final.push(x) } });
		return final;
	}//Weldone!

	try { return this.querySelectorAll(e); } catch (e) { return }
}

/** @returns {htmlhc.lib.widget.ExtendedHTML} */
export let $$ = document.$$.bind(document);

document.$ = HTMLElement.prototype.$ = function (e0) { return this.$$(...arguments)[0] }

/** @function @returns {htmlhc.lib.widget.ExtendedHTML} */
export let $ = document.$.bind(document);

if (!window.$) {
	//jQuery uses $. Let's avoid them
	window.$ = $;
}


/**
 * @returns {htmlhc.lib.widget.ExtendedHTML<import('./index.mjs').Widget>}
 */
export let spawn = HTMLElement.prototype.spawn = document.spawn = function ({ tag = 'div', style = {}, classes = [], innerHTML = '', attributes = {}, direct = {}, onclick = () => undefined, events = {}, children = [], ...rest } = {}) {
	let element = document.createElement(tag);
	element.onclick = onclick;
	element.innerHTML = innerHTML;
	for (var child of children) { element.appendChild(child); }
	for (var [prop, val] of Object.entries(rest)) { element.setAttribute(prop, val); }
	for (var [prop, val] of Object.entries(attributes)) { element.setAttribute(prop, val); }
	(this instanceof HTMLElement) ? this.appendChild(element) : '';
	for (var [p, v] of Object.entries(style)) {
		element.style.setProperty(p, v);
	}
	for (var [e, f] of Object.entries(events)) {
		element[e] = f;
	}
	for (let [a, b] of Object.entries(direct)) {
		element[a] = b
	}
	for (let clas of classes) { element.classList.add(clas); }
	return element;
}


HTMLElement.prototype.selects = function (selector) {
	//Useful for the ancestor function
	//This function determines if a selector matches a certain element
	try { return [...(this == document.body.parentElement ? window : this.parentElement).$$(selector)].some(e => e == this); } catch (e) { }
}

HTMLElement.prototype.ancestor = function (selector) { //Nothing I love more than Logic!
	let ancestor = this;
	while ((ancestor = ancestor.parentElement) != null) {
		if (ancestor.selects(selector)) return ancestor;
	}
}



//Minified md5
try {
	(function (n) { "use strict"; function d(n, t) { var r = (65535 & n) + (65535 & t); return (n >> 16) + (t >> 16) + (r >> 16) << 16 | 65535 & r } function f(n, t, r, e, o, u) { return d((c = d(d(t, n), d(e, u))) << (f = o) | c >>> 32 - f, r); var c, f } function l(n, t, r, e, o, u, c) { return f(t & r | ~t & e, n, t, o, u, c) } function v(n, t, r, e, o, u, c) { return f(t & e | r & ~e, n, t, o, u, c) } function g(n, t, r, e, o, u, c) { return f(t ^ r ^ e, n, t, o, u, c) } function m(n, t, r, e, o, u, c) { return f(r ^ (t | ~e), n, t, o, u, c) } function i(n, t) { var r, e, o, u; n[t >> 5] |= 128 << t % 32, n[14 + (t + 64 >>> 9 << 4)] = t; for (var c = 1732584193, f = -271733879, i = -1732584194, a = 271733878, h = 0; h < n.length; h += 16)c = l(r = c, e = f, o = i, u = a, n[h], 7, -680876936), a = l(a, c, f, i, n[h + 1], 12, -389564586), i = l(i, a, c, f, n[h + 2], 17, 606105819), f = l(f, i, a, c, n[h + 3], 22, -1044525330), c = l(c, f, i, a, n[h + 4], 7, -176418897), a = l(a, c, f, i, n[h + 5], 12, 1200080426), i = l(i, a, c, f, n[h + 6], 17, -1473231341), f = l(f, i, a, c, n[h + 7], 22, -45705983), c = l(c, f, i, a, n[h + 8], 7, 1770035416), a = l(a, c, f, i, n[h + 9], 12, -1958414417), i = l(i, a, c, f, n[h + 10], 17, -42063), f = l(f, i, a, c, n[h + 11], 22, -1990404162), c = l(c, f, i, a, n[h + 12], 7, 1804603682), a = l(a, c, f, i, n[h + 13], 12, -40341101), i = l(i, a, c, f, n[h + 14], 17, -1502002290), c = v(c, f = l(f, i, a, c, n[h + 15], 22, 1236535329), i, a, n[h + 1], 5, -165796510), a = v(a, c, f, i, n[h + 6], 9, -1069501632), i = v(i, a, c, f, n[h + 11], 14, 643717713), f = v(f, i, a, c, n[h], 20, -373897302), c = v(c, f, i, a, n[h + 5], 5, -701558691), a = v(a, c, f, i, n[h + 10], 9, 38016083), i = v(i, a, c, f, n[h + 15], 14, -660478335), f = v(f, i, a, c, n[h + 4], 20, -405537848), c = v(c, f, i, a, n[h + 9], 5, 568446438), a = v(a, c, f, i, n[h + 14], 9, -1019803690), i = v(i, a, c, f, n[h + 3], 14, -187363961), f = v(f, i, a, c, n[h + 8], 20, 1163531501), c = v(c, f, i, a, n[h + 13], 5, -1444681467), a = v(a, c, f, i, n[h + 2], 9, -51403784), i = v(i, a, c, f, n[h + 7], 14, 1735328473), c = g(c, f = v(f, i, a, c, n[h + 12], 20, -1926607734), i, a, n[h + 5], 4, -378558), a = g(a, c, f, i, n[h + 8], 11, -2022574463), i = g(i, a, c, f, n[h + 11], 16, 1839030562), f = g(f, i, a, c, n[h + 14], 23, -35309556), c = g(c, f, i, a, n[h + 1], 4, -1530992060), a = g(a, c, f, i, n[h + 4], 11, 1272893353), i = g(i, a, c, f, n[h + 7], 16, -155497632), f = g(f, i, a, c, n[h + 10], 23, -1094730640), c = g(c, f, i, a, n[h + 13], 4, 681279174), a = g(a, c, f, i, n[h], 11, -358537222), i = g(i, a, c, f, n[h + 3], 16, -722521979), f = g(f, i, a, c, n[h + 6], 23, 76029189), c = g(c, f, i, a, n[h + 9], 4, -640364487), a = g(a, c, f, i, n[h + 12], 11, -421815835), i = g(i, a, c, f, n[h + 15], 16, 530742520), c = m(c, f = g(f, i, a, c, n[h + 2], 23, -995338651), i, a, n[h], 6, -198630844), a = m(a, c, f, i, n[h + 7], 10, 1126891415), i = m(i, a, c, f, n[h + 14], 15, -1416354905), f = m(f, i, a, c, n[h + 5], 21, -57434055), c = m(c, f, i, a, n[h + 12], 6, 1700485571), a = m(a, c, f, i, n[h + 3], 10, -1894986606), i = m(i, a, c, f, n[h + 10], 15, -1051523), f = m(f, i, a, c, n[h + 1], 21, -2054922799), c = m(c, f, i, a, n[h + 8], 6, 1873313359), a = m(a, c, f, i, n[h + 15], 10, -30611744), i = m(i, a, c, f, n[h + 6], 15, -1560198380), f = m(f, i, a, c, n[h + 13], 21, 1309151649), c = m(c, f, i, a, n[h + 4], 6, -145523070), a = m(a, c, f, i, n[h + 11], 10, -1120210379), i = m(i, a, c, f, n[h + 2], 15, 718787259), f = m(f, i, a, c, n[h + 9], 21, -343485551), c = d(c, r), f = d(f, e), i = d(i, o), a = d(a, u); return [c, f, i, a] } function a(n) { for (var t = "", r = 32 * n.length, e = 0; e < r; e += 8)t += String.fromCharCode(n[e >> 5] >>> e % 32 & 255); return t } function h(n) { var t = []; for (t[(n.length >> 2) - 1] = void 0, e = 0; e < t.length; e += 1)t[e] = 0; for (var r = 8 * n.length, e = 0; e < r; e += 8)t[e >> 5] |= (255 & n.charCodeAt(e / 8)) << e % 32; return t } function e(n) { for (var t, r = "0123456789abcdef", e = "", o = 0; o < n.length; o += 1)t = n.charCodeAt(o), e += r.charAt(t >>> 4 & 15) + r.charAt(15 & t); return e } function r(n) { return unescape(encodeURIComponent(n)) } function o(n) { return a(i(h(t = r(n)), 8 * t.length)); var t } function u(n, t) { return function (n, t) { var r, e, o = h(n), u = [], c = []; for (u[15] = c[15] = void 0, 16 < o.length && (o = i(o, 8 * n.length)), r = 0; r < 16; r += 1)u[r] = 909522486 ^ o[r], c[r] = 1549556828 ^ o[r]; return e = i(u.concat(h(t)), 512 + 8 * t.length), a(i(c.concat(e), 640)) }(r(n), r(t)) } function t(n, t, r) { return t ? r ? u(t, n) : e(u(t, n)) : r ? o(n) : e(o(n)) } "function" == typeof define && define.amd ? define(function () { return t }) : "object" == typeof module && module.exports ? module.exports = t : n.md5 = t })(this || window);
	//sourceMappingURL=md5.min.js.map
} catch (e) {
	console.log(e)
}


String.prototype.replaceAll = String.prototype.replaceAll || function (find, rep) {
	let text = this;
	while (text.search(find) != -1) {
		text = text.replace(find, rep);
	}
	return text;
}


export let random = function (min, max) {
	//Very important when getting a random number in a certain range
	return ((Math.random() * 10e9) % (max - min)) + min;
}




/**
 * This method is used to make sure the website fits well on mobile devices by taking up the avialable viewport as it should
 */
export let setupViewport = window.makeScalable = function () {
	document.head.spawn({
		tag: 'meta',
		name: 'viewport',
		content: 'width=device-width,initial-scale=1.0,user-scalable=no'
	});
}

EventTarget.prototype.fire = function (event) {
	console.warn(`This method is deprecated. Use dispatchEvent()`)
	if (Array.isArray(event)) for (e of event) this.fire(e);

	event = typeof event == 'string' ? new CustomEvent(...arguments) : event;
	this.dispatchEvent(event);
}

EventTarget.prototype.on = function (event, func, ...rest) {
	console.warn(`This method is deprecated\nUse addEventListener()`)

	if (Array.isArray(event)) {
		for (var e of event) { this.on(e, func); }
		return;
	}
	let target = this;
	return this.addEventListener(event, function () {
		func.end = function () {
			target.removeEventListener(event, func);
		};
		func.apply(this, arguments); //Damn!! JavaScript
	}, ...rest);
}

/* Subscribes to an event once so that the function gets called only when the event happens for the first time
The function callback should return true if it wants to continue receiving the event */
EventTarget.prototype.once = function (event, func) {
	this.on(event, func, { once: true })
}


//export let hc = window.hc = {
export function parsePath(string) {
	let parts = /^(.+\/)([^/]*)$/.exec(string);
	return { path: parts[1], file: /[^/]+\.*[^/]+/.exec(parts[2])[0] }
};
export function addCSS(href) {
	/** @type {HTMLLinkElement} */
	let link = document.head.spawn({ tag: 'link', rel: 'stylesheet', href: href });
	return new Promise((resolve, reject) => {
		const good = () => {
			cleanup()
			resolve();
		}
		const bad = (e) => {
			cleanup()
			reject(e)
		}
		const cleanup = () => {
			link.removeEventListener('load', good)
			link.removeEventListener('error', bad)
		}
		link.addEventListener('load', good)
		link.addEventListener('error', bad)
	})
};

export function importJS(src) {
	return new Promise((y, n) => {
		/** @type {HTMLScriptElement} */
		let script = document.head.spawn({ tag: 'script', src: src });
		const err = (e) => {
			n(e)
			cleanup()
		}
		const good = () => {
			y()
			cleanup()
		}

		const cleanup = () => {
			script.removeEventListener('load', good)
			script.removeEventListener('error', err)
		}
		script.addEventListener('load', good)
		script.addEventListener('error', err)
	})
};

/**
 * 
 * @param {string} importUrl This is usually import.meta.url
 * @param {string} cssFile If specified, a CSS file other than the css equivalent of the import url will be fetched
 * 
 * For example from home.js
 * 
 * importModuleCSS(import.meta.url) //Importing home.css
 * importModuleCSS(import.meta.url, 'style.css') //Importing style.css in the same directory
 */
export function importModuleCSS(importUrl, cssFile) {
	return new Promise((resolve, reject) => {

		let finalCSSUrl;

		if (!importUrl) {
			const stack = new Error().stack;

			try {
				importUrl = getCaller(0, [/html-hc\/lib/])
				if (!importUrl) {
					console.trace(`No import url??`)
				}
				// console.trace(`Auto calculated import url : ${importUrl} Now importing the css file with the same name`)
			} catch (e) {
				//This type of error needs reporting
				console.log(new Error())
				console.log(`Failed to auto import Severe error: `, e);
				console.log(`Stack trace for caclulations\n`, stack)
				reject(e)
			}
		}
		let { path, file } = parsePath(importUrl);
		let moduleCSSUrl = `${path}${/(.+)[.][^.]+$/.exec(file)[1]}.css`
		finalCSSUrl = new URL(cssFile || moduleCSSUrl, importUrl).href;


		//Now check if the stylesheet already exists
		for (let sheet of document.styleSheets) {
			if (sheet.href == finalCSSUrl) {
				return
			}
		}

		addCSS(finalCSSUrl).then(resolve, reject)

	})


}


/**
 * This method tells us the script that called your function
 * @param {number} offset A number of lines to skip
 * @param {RegExp[]} ignoreRegExps A list of regular expressions that determine
 * the lines to ignore
 * @returns {string}
 */
export function getCaller(offset = 0, ignoreRegExps = []) {

	/**
	 * This function removes repeated lines from the stack
	 * If we have 
	 * 		https://somewhere.com/somescript.mjs:43:3
	 * 		https://somewhere.com/somescript.mjs:40:27
	 * Only the first will be considered
	 * @param {string[]} lines
	 * @returns {string[]}
	 */
	function removeRepeated(lines) {
		const value = []
		for (let i = 0; i < lines.length; i++) {
			const line = getRealURL(lines[i])
			if (line !== value.at(-1)) {
				value.push(line)
			}
		}
		return value
	}


	/**
	 * This method gets the full URL, out of a line in the stack trace
	 * @param {string} line 
	 * @returns {string}
	 */
	function getRealURL(line) {
		return /([a-z]+:\/\/.+)(?::\d+:\d+)/.exec(line)?.[1]
	}

	let lines = new Error().stack.split('\n')
	const defaultIgnores = [/^[^:\/]+(?!(\:\/\/))+$/] //By default, ignore all stack lines that don't have URLs
	if (/Error/g.test(lines[0])) {
		lines = lines.slice(1)
	}
	lines = removeRepeated(
		lines.filter(x => !([...ignoreRegExps, ...defaultIgnores].some(reg => reg.test(x))))
	)

	const line = lines[
		offset + (
			// If the first line is already ignored, let's not increase the offset
			// [...ignoreRegExps].some(reg => reg.test(lines[0])) ? 0 : 1
			0
		)
	]


	if (!/http/.test(line)) {
		// console.warn(`Returning a monster:\n${line}\nfrom:\n`, lines, `\nthat came from:\n${new Error().stack}\nWith offset ${offset}`)
	}

	return line
}

export { watchToCSS }


importModuleCSS(import.meta.url)
setupViewport()