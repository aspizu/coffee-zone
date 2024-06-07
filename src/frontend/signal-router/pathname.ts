export function split(pathname: string) {
	const segments = pathname.slice(1).split("/")
	if (segments.length === 1 && segments[0] === "") {
		return []
	}
	return segments
}

export function join(segments: string[]) {
	return "/" + segments.join("/")
}

export default {split, join}
