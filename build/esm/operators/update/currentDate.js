import { applyUpdate, DEFAULT_OPTIONS, walkExpression } from "./_internal";
function $currentDate(expr, arrayFilters = [], options = DEFAULT_OPTIONS) {
  return (obj) => {
    return walkExpression(
      expr,
      arrayFilters,
      options,
      (val, node, queries) => {
        return applyUpdate(
          obj,
          node,
          queries,
          (o, k) => {
            o[k] = val === true || val.$type === "date" ? options.now : options.now.getTime();
            return true;
          },
          { buildGraph: true }
        );
      }
    );
  };
}
export {
  $currentDate
};
