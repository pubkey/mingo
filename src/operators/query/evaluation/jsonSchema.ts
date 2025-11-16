import { Any, AnyObject, Options, Predicate } from "../../../types";
import { assert } from "../../../util";

/**
 * Validate document against a given JSON Schema.
 */
export function $jsonSchema(
  _: string,
  schema: Any,
  options: Options
): Predicate<Any> {
  assert(
    !!options?.jsonSchemaValidator,
    "$jsonSchema: must configure 'jsonSchemaValidator' option to this operator."
  );
  const validate = options?.jsonSchemaValidator(schema as AnyObject);
  return (obj: AnyObject) => validate(obj);
}
