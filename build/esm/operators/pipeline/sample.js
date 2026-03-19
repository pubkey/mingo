import { Lazy } from "../../lazy";
function $sample(coll, expr, _options) {
  return coll.transform((xs) => {
    const len = xs.length;
    let i = -1;
    return Lazy(() => {
      if (++i === expr.size) return { done: true };
      const n = Math.floor(Math.random() * len);
      return { value: xs[n], done: false };
    });
  });
}
export {
  $sample
};
