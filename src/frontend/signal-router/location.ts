import {signal, type ReadonlySignal} from "@preact/signals"

const _location = signal(window.location.href)
/** The current location as a signal.
 *
 * This signal is updated whenever the location changes, either through
 * `location.navigate()` or through the browser's back/forward buttons.
 * Setting the value of this signal is undefined behavior.
 */
export const location: ReadonlySignal<string> = _location

addEventListener("popstate", (event) => {
	event.preventDefault()
	_location.value = window.location.href
})

addEventListener("hashchange", (event) => {
	event.preventDefault()
	_location.value = window.location.href
})

/** Navigate to location, if replace is true then the current location will not be added
 * to the browser's history. */
export function navigate(
	location: string,
	{replace = false}: {replace?: boolean} = {},
) {
	const url = new URL(location, window.location.origin)
	if (url.origin === window.location.origin) {
		if (replace) {
			window.history.replaceState(undefined, "", url.href)
		} else {
			window.history.pushState(undefined, "", url.href)
		}
		_location.value = url.href
	} else if (replace) {
		window.location.replace(url.href)
		return
	}
	window.location.href = url.href
}
