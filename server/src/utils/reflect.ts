export function reflect<T>(p: Promise<T>) {
  return p
    .then((value) => ({ status: "fulfilled", value }))
    .catch((error) => ({ status: "rejected", error }))
}
