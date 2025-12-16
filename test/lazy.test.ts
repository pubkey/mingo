import { Lazy, Source } from "../src/lazy";

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function isEven(n: number) {
  return n % 2 === 0;
}

describe("lazy", () => {
  it("can create from stream object", () => {
    let i = 0;
    const max = 10;
    const stream = {
      next() {
        if (i == max) return { done: true };
        return { value: i++, done: false };
      }
    };

    const res = Lazy(stream).reduce<number>(
      (acc, n) => (acc as number) + (n as number),
      0
    );
    expect(res).toBe(45);
    expect(i).toBe(max);
  });

  it("can map", () => {
    const result = Lazy(data)
      .map(n => (n as number) * 3)
      .collect();
    expect(result).toStrictEqual([3, 6, 9, 12, 15, 18, 21, 24, 27]);
  });

  it("can filter", () => {
    const result = Lazy(data).filter(isEven).collect();
    expect(result).toStrictEqual([2, 4, 6, 8]);
  });

  it("can drop a given number", () => {
    expect(Lazy(data).drop(3).collect()).toStrictEqual([4, 5, 6, 7, 8, 9]);
  });

  it("can drop all but last", () => {
    const n = data.length - 1;
    expect(Lazy(data).drop(n).size()).toEqual(1);
  });

  it("can drop all", () => {
    expect(Lazy(data).drop(data.length).size()).toEqual(0);
  });

  it("can take a given number", () => {
    expect(Lazy(data).take(3).collect()).toStrictEqual([1, 2, 3]);
  });

  it("can take all but last", () => {
    const n = data.length - 1;
    expect(Lazy(data).take(n).size()).toEqual(n);
  });

  it("can take all", () => {
    expect(Lazy(data).take(data.length).size()).toEqual(data.length);
  });

  // terminal method tests
  it("can reduce", () => {
    const result = Lazy(data).reduce(
      (acc, n) => (acc as number) + (n as number)
    );
    expect(result).toBe(45);
  });

  it("can iterate with each", () => {
    const arr: number[] = [];
    Lazy(data).each(o => arr.push((o as number) % 2));
    expect(arr).toStrictEqual([1, 0, 1, 0, 1, 0, 1, 0, 1]);
  });

  it("can count sequence", () => {
    expect(Lazy(data).size()).toBe(data.length);
  });

  it("should throw when source is invalid", () => {
    expect(() => Lazy(5 as unknown as Source)).toThrow();
  });

  it("should iterate with for-loop", () => {
    let i = 0;
    for (const item of Lazy(data)) {
      if (typeof item === "number") i++;
    }
    expect(i).toBe(data.length);
  });
});
