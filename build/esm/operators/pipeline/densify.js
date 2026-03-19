import { concat, Lazy } from "../../lazy";
import {
  assert,
  HashMap,
  isArray,
  isDate,
  isInteger,
  isNil,
  isNumber,
  isObject,
  isString,
  resolve
} from "../../util";
import { TIME_UNITS } from "../expression/date/_internal";
import { $dateAdd } from "../expression/date/dateAdd";
import { $sort } from "./sort";
const OP = "$densify";
function $densify(coll, expr, options) {
  const { step, bounds, unit } = expr.range;
  if (unit) {
    assert(
      TIME_UNITS.includes(unit),
      `${OP} 'range.unit' value is not supported.`
    );
    assert(
      isInteger(step) && step > 0,
      `${OP} 'range.step' must resolve to integer if 'range.unit' is specified.`
    );
  } else {
    assert(isNumber(step), `${OP} 'range.step' must resolve to number.`);
  }
  if (isArray(bounds)) {
    assert(
      !!bounds && bounds.length === 2,
      `${OP} 'range.bounds' must have exactly two elements.`
    );
    assert(
      (bounds.every(isNumber) || bounds.every(isDate)) && bounds[0] < bounds[1],
      `${OP} 'range.bounds' must be ordered lower then upper.`
    );
    if (unit) {
      assert(
        bounds.every(isDate),
        `${OP} 'range.bounds' must be dates if 'range.unit' is specified.`
      );
    }
  }
  if (expr.partitionByFields) {
    assert(
      isArray(expr.partitionByFields),
      `${OP} 'partitionByFields' must resolve to array of strings.`
    );
  }
  const partitionByFields = expr.partitionByFields ?? [];
  coll = $sort(coll, { [expr.field]: 1 }, options);
  const computeNextValue = (value) => {
    return isNumber(value) ? value + step : $dateAdd({}, { startDate: value, unit, amount: step }, options);
  };
  const isValidUnit = !!unit && TIME_UNITS.includes(unit);
  const getFieldValue = (o) => {
    const v = resolve(o, expr.field);
    assert(
      isNil(v) || isDate(v) && isValidUnit || isNumber(v) && !isValidUnit,
      `${OP} Densify field type must be numeric with 'unit' unspecified, or a date with 'unit' specified.`
    );
    return v;
  };
  const peekItem = new Array();
  const nilFieldsIterator = Lazy(() => {
    const item = coll.next();
    const fieldValue = getFieldValue(item.value);
    if (isNil(fieldValue)) return item;
    peekItem.push(item);
    return { done: true };
  });
  const nextDensifyValueMap = HashMap.init();
  const [lower, upper] = isArray(bounds) ? bounds : [bounds, bounds];
  let maxFieldValue;
  const updateMaxFieldValue = (value) => {
    maxFieldValue = maxFieldValue === void 0 || maxFieldValue < value ? value : maxFieldValue;
  };
  const rootKey = [];
  const densifyIterator = Lazy(() => {
    const item = peekItem.pop() || coll.next();
    if (item.done) return item;
    let partitionKey = rootKey;
    if (isArray(partitionByFields)) {
      partitionKey = partitionByFields.map(
        (k) => resolve(item.value, k)
      );
      assert(
        partitionKey.every(isString),
        "$densify: Partition fields must evaluate to string values."
      );
    }
    assert(isObject(item.value), "$densify: collection must contain documents");
    const itemValue = getFieldValue(item.value);
    if (!nextDensifyValueMap.has(partitionKey)) {
      if (lower == "full") {
        if (!nextDensifyValueMap.has(rootKey)) {
          nextDensifyValueMap.set(rootKey, itemValue);
        }
        nextDensifyValueMap.set(
          partitionKey,
          nextDensifyValueMap.get(rootKey)
        );
      } else if (lower == "partition") {
        nextDensifyValueMap.set(partitionKey, itemValue);
      } else {
        nextDensifyValueMap.set(partitionKey, lower);
      }
    }
    const densifyValue = nextDensifyValueMap.get(partitionKey);
    if (
      // current item field value is lower than current densify value.
      itemValue <= densifyValue || // range value equals or exceeds upper bound
      upper != "full" && upper != "partition" && densifyValue >= upper
    ) {
      if (densifyValue <= itemValue) {
        nextDensifyValueMap.set(partitionKey, computeNextValue(densifyValue));
      }
      updateMaxFieldValue(itemValue);
      return item;
    }
    nextDensifyValueMap.set(partitionKey, computeNextValue(densifyValue));
    updateMaxFieldValue(densifyValue);
    const denseObj = { [expr.field]: densifyValue };
    if (partitionKey) {
      partitionKey.forEach((v, i) => {
        denseObj[partitionByFields[i]] = v;
      });
    }
    peekItem.push(item);
    return { done: false, value: denseObj };
  });
  if (lower !== "full") return concat(nilFieldsIterator, densifyIterator);
  let paritionIndex = -1;
  let partitionKeysSet;
  const fullBoundsIterator = Lazy(() => {
    if (paritionIndex === -1) {
      const fullDensifyValue = nextDensifyValueMap.get(rootKey);
      nextDensifyValueMap.delete(rootKey);
      partitionKeysSet = Array.from(nextDensifyValueMap.keys());
      if (partitionKeysSet.length === 0) {
        partitionKeysSet.push(rootKey);
        nextDensifyValueMap.set(rootKey, fullDensifyValue);
      }
      paritionIndex++;
    }
    do {
      const partitionKey = partitionKeysSet[paritionIndex];
      const partitionMaxValue = nextDensifyValueMap.get(partitionKey);
      if (partitionMaxValue < maxFieldValue) {
        nextDensifyValueMap.set(
          partitionKey,
          computeNextValue(partitionMaxValue)
        );
        const denseObj = { [expr.field]: partitionMaxValue };
        partitionKey.forEach((v, i) => {
          denseObj[partitionByFields[i]] = v;
        });
        return { done: false, value: denseObj };
      }
      paritionIndex++;
    } while (paritionIndex < partitionKeysSet.length);
    return { done: true };
  });
  return concat(nilFieldsIterator, densifyIterator, fullBoundsIterator);
}
export {
  $densify
};
