import { describe, expect, it } from "vitest";

import { aggregate } from "../src";
import { Context, evalExpr, ProcessingMode } from "../src/core";
import * as accumulatorOperators from "../src/operators/accumulator";
import * as expressionOperators from "../src/operators/expression";
import * as pipelineOperators from "../src/operators/pipeline";
import * as projectionOperators from "../src/operators/projection";
import * as queryOperators from "../src/operators/query";
import * as windowOperators from "../src/operators/window";
import type { Any, AnyObject, Callback, Options } from "../src/types";
import complexGrades from "./data/grades_complex";
import simpleGrades from "./data/grades_simple";
import person from "./data/person";
import students from "./data/students";

export const DEFAULT_OPTS = Object.freeze({
  idKey: "_id",
  scriptEnabled: true,
  useStrictMode: true,
  failOnError: true,
  processingMode: ProcessingMode.CLONE_OFF,
  context: Context.init({
    accumulator: accumulatorOperators,
    expression: expressionOperators,
    pipeline: pipelineOperators,
    projection: projectionOperators,
    query: queryOperators,
    window: windowOperators
  })
});

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

export function makeRandomString(length: number) {
  const size = Math.round(length / 15);
  const text = new Array<string>(size);
  for (let i = 0; i < size; i++) {
    text[i] = Math.floor(Math.random() * 1e17).toString(16);
  }
  return text.join("");
}

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
          const ctx = (val[2] ?? {}) as AnyObject;
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

          if (expected instanceof Error) {
            let msg = expected.message;
            // quote regex chars
            "[](){}".split("").forEach(v => (msg = msg.replace(v, `\\${v}`)));
            it(`${prefix} => Error("${msg}")`, () => {
              expect(() =>
                evalExpr(obj, { [field]: input }, DEFAULT_OPTS)
              ).toThrow(new RegExp(msg));
            });
          } else {
            it(`${prefix} => ${JSON.stringify(expected)}`, () => {
              const copts = { ...DEFAULT_OPTS, ...ctx };
              let actual = evalExpr(obj, { [field]: input }, copts);
              // NaNs don't compare so normalize
              if (Object.is(actual, expected)) actual = expected = 0;
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
