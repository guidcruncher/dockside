export const jsonClone = (v: any) => {
  if (!v) return undefined
  return JSON.parse(JSON.stringify(v))
}
