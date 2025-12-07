// benchmark.ts
/*eslint-disable no-console*/
function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.random() * 1e6);
}

function benchmark(size: number): void {
  const arr1: number[] = randomArray(size);
  const arr2: number[] = arr1.slice(); // clone with slice()

  console.time(`Array.sort comparator (${size})`);
  arr1.sort((a: number, b: number) => a - b);
  console.timeEnd(`Array.sort comparator (${size})`);

  console.time(`Float64Array.sort + copy (${size})`);
  const typed: Float64Array = new Float64Array(arr2);
  typed.sort();
  typed.forEach((v: number, i: number) => {
    arr2[i] = v;
  });
  console.timeEnd(`Float64Array.sort + copy (${size})`);

  // sanity check
  const equalResults: boolean = arr1.every((v, i) => v === arr2[i]);
  console.log("Equal results?", equalResults);
}

// Run benchmarks for different sizes
benchmark(10_000);
benchmark(100_000);
benchmark(1_000_000);
