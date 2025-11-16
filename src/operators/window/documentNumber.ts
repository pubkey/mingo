import { Any, AnyObject, Options, WindowOperator } from "../../types";
import { WindowOperatorInput } from "./_internal";

/** Returns the position of a document in the $setWindowFields stage partition. */
export const $documentNumber: WindowOperator = (
  _obj: AnyObject,
  _collection: AnyObject[],
  expr: WindowOperatorInput,
  _options: Options
): Any => expr.documentNumber;
