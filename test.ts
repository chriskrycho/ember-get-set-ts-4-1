import { AnyPathIn, ObjectProxy, PropType } from ".";

type Test = {
  a?: string;
  z: string;
  b: ObjectProxy<string>;
  c: {
    a: string;
    b?: ObjectProxy<string>;
  };
  d: {
    a: {
      a: string;
    };
    b?: ObjectProxy<{
      a: string;
    }>;
  };
};

type ResolvedPath = AnyPathIn<Test>;
type In<A, Cond> = A extends Cond ? true : false;
type A = In<"a.length", ResolvedPath>;
type B = In<"z.length", ResolvedPath>;
type ResolvedType = PropType<Test, "a.length">;
