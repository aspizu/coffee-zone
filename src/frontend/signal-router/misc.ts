export function valueof<T>(
    value:
        | T
        | {
              value: T
          },
): T {
    if (typeof value === "object" && value !== null && "value" in value) {
        return value.value
    }
    return value
}
