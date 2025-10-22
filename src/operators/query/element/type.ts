import { Options, QueryOperator } from "../../../core/_internal";
import { Any } from "../../../types";
import { $type as __type, processQuery } from "../../_predicates";

/**
 * Selects documents if a field is of the specified type.
 */
export const $type: QueryOperator = (
  selector: string,
  value: Any,
  options: Options
) => processQuery(selector, value, options, __type);
