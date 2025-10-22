import { Options, QueryOperator } from "../../../core/_internal";
import { Any } from "../../../types";
import { processBitwiseQuery } from "./_internal";

/**
 * Matches numeric or binary values in which any bit from a set of bit positions has a value of 0.
 */
export const $bitsAnyClear: QueryOperator = (
  selector: string,
  value: Any,
  _options: Options
) => processBitwiseQuery(selector, value, (result, mask) => result < mask);
