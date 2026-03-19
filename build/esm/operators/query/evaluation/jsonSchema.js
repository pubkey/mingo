import { assert } from "../../../util";
function $jsonSchema(_, schema, options) {
  assert(
    !!options?.jsonSchemaValidator,
    "$jsonSchema requires 'jsonSchemaValidator' option to be defined."
  );
  const validate = options.jsonSchemaValidator(schema);
  return (obj) => validate(obj);
}
export {
  $jsonSchema
};
