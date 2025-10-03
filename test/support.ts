import { aggregate as srcAggregate, find as srcFind } from "../src";
import {
  ComputeOptions,
  computeValue,
  Options,
  ProcessingMode
} from "../src/core";
import fullContext from "../src/init/context";
import { Source } from "../src/lazy";
import { Any, AnyObject, Callback } from "../src/types";
import complexGrades from "./data/grades_complex";
import simpleGrades from "./data/grades_simple";
import person from "./data/person";
import students from "./data/students";

export const DEFAULT_OPTS = Object.freeze({
  idKey: "_id",
  scriptEnabled: true,
  useStrictMode: true,
  useGlobalContext: true,
  processingMode: ProcessingMode.CLONE_OFF,
  context: fullContext()
});

export const COMPUTE_OPTS = ComputeOptions.init(DEFAULT_OPTS);

export const complexGradesData = complexGrades;
export const simpleGradesData = simpleGrades;
export const studentsData = students;
export const personData = person;

export const ISODate = (s: string) => new Date(s);

export const testPath = (filename: string): string =>
  filename.slice(filename.indexOf("test/operators"));

class objectId {
  constructor(readonly _id: string) {}
  toString() {
    return this._id;
  }
  toJSON(): string {
    return this._id;
  }
}
export const ObjectId = (id: string) => new objectId(id);

export const aggregate = (
  coll: Source,
  pipeline: AnyObject[],
  options?: Partial<Options>
) => srcAggregate(coll, pipeline, Object.assign({}, DEFAULT_OPTS, options));

export const find = (
  collection: Source,
  condition: AnyObject,
  projection?: AnyObject,
  options?: Partial<Options>
) => srcFind(collection, condition, projection ?? {}, options ?? DEFAULT_OPTS);

export function runTest(
  description: string,
  suite: Record<string, Any[]>
): void {
  Object.entries(suite).forEach(arr => {
    const operator = arr[0];
    const examples = arr[1] as Any[][];
    describe(description, () => {
      describe(operator, () => {
        examples.forEach(val => {
          let input = val[0] as AnyObject;
          let expected = val[1];
          const ctx = (val[2] || { err: false }) as AnyObject;
          const obj = ctx?.obj || {};

          let field: string | null = operator;
          // use the operator as field if not present in input
          if (!!input && input.constructor === Object) {
            field = Object.keys(input).find(s => s[0] === "$") || null;
            if (!field) {
              field = operator;
            } else {
              input = input[field] as AnyObject;
            }
          }

          const prefix = `can apply ${operator}(${JSON.stringify(input)})`;

          if (ctx.err) {
            it(`${prefix} => Error("${expected as string}")`, () => {
              expect(() =>
                computeValue(obj, input, field, COMPUTE_OPTS)
              ).toThrow();
            });
          } else {
            it(`${prefix} => ${JSON.stringify(expected)}`, () => {
              let actual = computeValue(obj, input, field, COMPUTE_OPTS);
              // NaNs don't compare
              if (actual !== actual && expected !== expected) {
                actual = expected = 0;
              }
              expect(actual).toEqual(expected);
            });
          }
        });
      });
    });
  });
}

interface PipelineTestSuite {
  input: Any[];
  pipeline: AnyObject[];
  expected: Any;
  message: string;
  options?: Partial<Options>;
}
/**
 * run pipeline test
 */
export function runTestPipeline(
  description: string,
  suite: PipelineTestSuite[]
): void {
  describe(description, () => {
    suite.forEach(unitTest => {
      const { input, pipeline, expected, message, options } = unitTest;
      const actual = aggregate(input, pipeline, {
        ...DEFAULT_OPTS,
        ...options,
        processingMode: ProcessingMode.CLONE_INPUT
      });
      it(message, () => {
        if (typeof expected === "function") {
          const cb = expected as Callback<Any>;
          cb(actual);
        } else {
          expect(actual).toEqual(expected);
        }
      });
    });
  });
}

/**
 * Check if a date is in daylight saving time (DST).
 * @param date The date to check.
 * @returns True if the date is in DST, false otherwise.
 */
export function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== date.getTimezoneOffset();
}
