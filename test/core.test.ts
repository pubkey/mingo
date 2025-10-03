import {
  ComputeOptions,
  computeValue,
  Context,
  Options,
  OpType,
  ProcessingMode,
  useOperators
} from "../src/core";
import { Iterator } from "../src/lazy";
import { $toString } from "../src/operators/expression";
import { $match } from "../src/operators/pipeline/match";
import { Any, AnyObject } from "../src/types";
import { resolve } from "../src/util";
import { COMPUTE_OPTS, DEFAULT_OPTS, find } from "./support";

const copts = ComputeOptions.init(DEFAULT_OPTS);

describe("core", () => {
  afterEach(() => {
    copts.update({});
  });

  describe("Context", () => {
    it("should register operators with Context.init()", () => {
      const customPipelineOps = {
        $customPipeline: () => new Iterator([])
      };
      const customExpressionOps = {
        $customExpression: () => 42
      };

      const ctx = Context.init({
        pipeline: customPipelineOps,
        expression: customExpressionOps
      });

      expect(ctx.getOperator(OpType.PIPELINE, "$customPipeline")).toEqual(
        customPipelineOps.$customPipeline
      );
      expect(ctx.getOperator(OpType.EXPRESSION, "$customExpression")).toEqual(
        customExpressionOps.$customExpression
      );
    });

    it("should clone with Context.from()", () => {
      const ctx = Context.init();
      expect(ctx.getOperator(OpType.PIPELINE, "$match")).toBeNull();

      ctx.addPipelineOps({ $match });
      expect(ctx.getOperator(OpType.PIPELINE, "$match")).toEqual($match);

      const clone = Context.from(ctx);
      expect(clone.getOperator(OpType.PIPELINE, "$match")).toEqual($match);
    });

    it("should merge two contexts with Context.merge()", () => {
      const ctx1 = Context.init({
        pipeline: { $match }
      });
      const ctx2 = Context.init({
        expression: { $toString }
      });

      const res = Context.merge(ctx1, ctx2);

      expect(ctx1.getOperator(OpType.PIPELINE, "$match")).toEqual($match);
      expect(ctx2.getOperator(OpType.EXPRESSION, "$toString")).toEqual(
        $toString
      );
      expect(ctx1.getOperator(OpType.EXPRESSION, "$toString")).toBeNull();
      expect(ctx2.getOperator(OpType.PIPELINE, "$match")).toBeNull();
      expect(res.getOperator(OpType.PIPELINE, "$match")).toEqual($match);
      expect(res.getOperator(OpType.EXPRESSION, "$toString")).toEqual(
        $toString
      );
    });
  });

  describe("ComputeOptions", () => {
    it("should preserve 'root' on init if defined", () => {
      expect(copts.root).toBeUndefined();
      copts.update({ root: false });
      expect(copts.root).toEqual(false);
      expect(ComputeOptions.init(copts).root).toEqual(false);
    });

    it("should preserve 'local' on init if defined", () => {
      expect(copts.local).toHaveProperty("now");
      expect(copts.local.now).toBeLessThanOrEqual(Date.now());
      copts.update({ root: null, groupId: 5 });
      expect(copts.local?.groupId).toEqual(5);
      expect(ComputeOptions.init(copts).local?.groupId).toEqual(5);
    });

    it("should access all members of init options", () => {
      copts.update({ root: true, variables: { x: 10 } });
      expect(copts.idKey).toEqual("_id");
      expect(copts.scriptEnabled).toEqual(true);
      expect(copts.useStrictMode).toEqual(true);
      expect(copts.processingMode).toEqual(ProcessingMode.CLONE_OFF);
      expect(copts.collation).toBeUndefined();
      expect(copts.collectionResolver).toBeUndefined();
      expect(copts.hashFunction).toBeUndefined();
      expect(copts.jsonSchemaValidator).toBeUndefined();
      expect(copts.variables).toBeUndefined();
      expect(copts.local?.variables).toEqual({ x: 10 });
      expect(copts.root).toEqual(true);
    });

    it("should merge new variables on update when non-empty", () => {
      copts.update({ root: true, variables: { x: 10 } });
      copts.update({ root: true, variables: { y: 20 } });
      expect(copts.local?.variables).toEqual({ x: 10, y: 20 });
    });

    it("should preserve value of 'local.now' across init() and update()", () => {
      const now = copts.local?.now;
      expect(now).toBeLessThanOrEqual(Date.now());

      const local = { root: false, groupId: 5, now: 200 };
      copts.update(local);
      expect(copts.local?.groupId).toEqual(5);
      expect(copts.local?.now).toEqual(now);
    });
  });

  describe("useOperators", () => {
    it("should register custom query operator globally", () => {
      function $between(selector: string, rhs: Any, _options?: Options) {
        const args = rhs as number[];
        // const value = lhs as number;
        return (obj: AnyObject): boolean => {
          const value = resolve(obj, selector, { unwrapArray: true }) as number;
          return value >= args[0] && value <= args[1];
        };
      }

      useOperators(OpType.QUERY, { $between });

      const coll = [
        { a: 1, b: 1 },
        { a: 7, b: 1 },
        { a: 10, b: 6 },
        { a: 20, b: 10 }
      ];
      const result = find(coll, { a: { $between: [5, 10] } }).all();
      expect(result.length).toBe(2);
    });
  });

  describe("computeValue", () => {
    it("throws for invalid operator", () => {
      expect(() => computeValue({}, {}, "$fakeOperator", COMPUTE_OPTS)).toThrow(
        Error
      );
    });

    it("computes current timestamp using $$NOW", () => {
      const result = computeValue(
        {},
        { date: "$$NOW" },
        null,
        COMPUTE_OPTS
      ) as {
        date: Date;
      };
      expect(result.date).toBeInstanceOf(Date);
      expect(result.date.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it("should return different values for $$NOW for successive calls with same plain options", async () => {
      const expr = { date: "$$NOW" };
      const result1 = computeValue({}, expr, null, DEFAULT_OPTS) as {
        date: Date;
      };

      // Introduce a delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const result2 = computeValue({}, expr, null, DEFAULT_OPTS) as {
        date: Date;
      };

      expect(result2.date.getTime()).toBeGreaterThan(result1.date.getTime());
    });

    it("should return same value for $$NOW for successive calls with same compute options", async () => {
      const expr = { date: "$$NOW" };
      const result1 = computeValue({}, expr, null, copts) as { date: Date };

      // Introduce a delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const result2 = computeValue({}, expr, null, copts) as { date: Date };

      expect(result2.date.getTime()).toEqual(result1.date.getTime());
    });

    it("issues#526: passes root object down call stack", () => {
      const obj = {
        value10: 10,
        value20: 20,
        value30: 30,
        value50: 50
      };
      const res = computeValue(
        obj,
        {
          data: {
            steps: [
              { range: [{ $min: [9, "$value10"] }, "$value20"] },
              { range: ["$value30", "$value50"] }
            ]
          }
        },
        null,
        COMPUTE_OPTS
      );
      expect(res).toEqual({
        data: {
          steps: [{ range: [9, 20] }, { range: [30, 50] }]
        }
      });
    });
  });
});
