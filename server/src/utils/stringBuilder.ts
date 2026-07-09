export class StringBuilder {
  private parts: string[] = []

  /** Gets the current length of the built string. */
  get length(): number {
    return this.toString().length
  }

  /** Appends a value to the builder. */
  append(value: unknown): StringBuilder {
    if (value !== null && value !== undefined) {
      this.parts.push(String(value))
    }
    return this
  }

  /** Appends a value followed by a newline (`\n`). */
  appendLine(value: unknown = ""): StringBuilder {
    this.append(value)
    this.parts.push("\n")
    return this
  }

  /** Clears the builder. */
  clear(): StringBuilder {
    this.parts.length = 0
    return this
  }

  /** Inserts a value at the specified character index. */
  insert(index: number, value: unknown): StringBuilder {
    const current = this.toString()
    const str = String(value)

    if (index < 0 || index > current.length) {
      throw new RangeError("Index out of range.")
    }

    const result = current.slice(0, index) + str + current.slice(index)

    this.parts = [result]
    return this
  }

  /** Removes `length` characters starting at `startIndex`. */
  remove(startIndex: number, length: number): StringBuilder {
    const current = this.toString()

    if (startIndex < 0 || length < 0 || startIndex + length > current.length) {
      throw new RangeError("Index and length out of range.")
    }

    const result = current.slice(0, startIndex) + current.slice(startIndex + length)

    this.parts = [result]
    return this
  }

  /** Returns the built string. */
  toString(): string {
    return this.parts.join("")
  }
}
