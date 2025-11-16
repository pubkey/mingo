import { Any, Options, QueryOperator } from "../../../types";
import { processBitwiseQuery } from "./_internal";

/**
 * Matches numeric or binary values in which any bit from a set of bit positions has a value of 1.
 */
export const $bitsAnySet: QueryOperator = (
  selector: string,
  value: Any,
  _options: Options
) => processBitwiseQuery(selector, value, (result, _) => result > 0);
