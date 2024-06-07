import {type Signal} from "@preact/signals"
import pathname from "./pathname"

type FilterVoid<T extends unknown[]> =
	T extends [] ? []
	: T extends [infer H, ...infer R] ?
		H extends void ?
			FilterVoid<R>
		:	[H, ...FilterVoid<R>]
	:	T

/** Placeholder for path parameters */
export enum Parameter {
	/** Non-negative integer */
	INTEGER,
	/** UUID Version 4 */
	UUID,
	/** Integer */
	NUMBER,
	/** String */
	STRING,
	/** Rest of the path, should only appear as the last item of a route pattern */
	REST,
}

/** A route pattern */
export type Route = readonly (RegExp | string | Parameter)[]

export type RouteParameters<T extends Route> = FilterVoid<
	[
		...{
			[K in keyof T]: T[K] extends Parameter.INTEGER ? number
			: T[K] extends Parameter.UUID ? string
			: T[K] extends Parameter.NUMBER ? number
			: T[K] extends Parameter.STRING ? string
			: T[K] extends Parameter.REST ? string
			: void
		},
	]
>

export type RouteSignalParameters<T extends Route> = FilterVoid<
	[
		...{
			[K in keyof T]: T[K] extends Parameter.INTEGER ? Signal<number>
			: T[K] extends Parameter.UUID ? Signal<string>
			: T[K] extends Parameter.NUMBER ? Signal<number>
			: T[K] extends Parameter.STRING ? Signal<string>
			: T[K] extends Parameter.REST ? Signal<string>
			: void
		},
	]
>

/** Match a route pattern against a location, returns the parameters if the location
 *  matches the pattern or undefined if it does not match. */
export function match<const T extends Route>(
	route: T,
	location: string,
): RouteParameters<T> | undefined {
	const url = new URL(location, window.location.origin)
	const segments = pathname.split(url.pathname)
	const parameters: any[] = []
	for (let i = 0; i < route.length; i++) {
		const pattern = route[i]
		if (pattern === Parameter.REST) {
			parameters.push(pathname.join(segments.slice(i)))
			break
		}
		if (segments.length <= i) {
			return undefined
		}
		const segment = segments[i]
		if (pattern === Parameter.INTEGER) {
			const integer = parseInt(segment)
			if (isNaN(integer) || integer < 0) {
				return undefined
			}
			parameters.push(integer)
			continue
		}
		if (pattern === Parameter.NUMBER) {
			const number = parseInt(segment)
			if (isNaN(number)) {
				return undefined
			}
			parameters.push(number)
			continue
		}
		if (pattern === Parameter.STRING) {
			parameters.push(segment)
			continue
		}
		if (pattern === Parameter.UUID) {
			if (
				!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
					segment,
				)
			) {
				return undefined
			}
			parameters.push(segment)
			continue
		}
		if (pattern instanceof RegExp) {
			if (!pattern.test(segment)) {
				return undefined
			}
			parameters.push(segment)
			continue
		}
		if (segment.toLocaleLowerCase() !== pattern.toLocaleLowerCase()) {
			return undefined
		}
	}
}

export default {match}
