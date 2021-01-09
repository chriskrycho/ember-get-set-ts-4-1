// Given deeply nested objects, we can get autocompletion help *and* type safety

import {
  EmberDataModel,
  EmberObject,
  get,
  getProperties,
  ObjectProxy,
  set,
  setProperties,
} from ".";

// against typos etc.:
declare let deeplyNested: { top: { middle: { bottom: string } } };
let doubleLength = get(deeplyNested, "top.middle.bottom.length") * 2;
get(deeplyNested, "top.middle.bottom.length") * 2;
set(deeplyNested, "top.middle", { bottom: "cool" });
set(deeplyNested, "top", { middle: { bottom: "wow" } });
set(deeplyNested, "top.middle.bottom", "amaze");
get(deeplyNested, "nonsense");
get(deeplyNested, "nonsense.at.any.level");
get(deeplyNested, "top.middle.even.if.starts.legit");

declare let nestedAndMultiple: {
  topA: { middleA: string };
  topB: number;
  topC: string;
};

let { topA, topB } = getProperties(nestedAndMultiple, "topA", "topB");
let total = topA.middleA.length + topB;

setProperties(nestedAndMultiple, { topB: 12, topC: "hello" });

// If we actually *have* an instance of an `ObjectProxy`...
declare let someProxy: ObjectProxy<{ someProp: string }>;

// ...we cannot directly access the fields on it.
someProxy.someProp; // 😭

// However, we *can* use `get` and then access the result! This works both for
// the `get` on the object...
someProxy.get("someProp").length; // 🎉

// ...and the standalone `get`:
get(someProxy, "someProp").length; // 🎉

// This can go as deeply as we need it to!
declare let nestedProxies: ObjectProxy<{
  top: ObjectProxy<{
    middle: ObjectProxy<{
      bottom: ObjectProxy<string>;
    }>;
  }>;
}>;
nestedProxies.get("top.middle.bottom").length; // 🎉
get(nestedProxies, "top.middle.bottom.length") * 2; // 🎉

class Complicated {
  justAString?: string;

  aNestedObject?: {
    stringProp: string;
    optionalNumberProp?: number;
  } = { stringProp: "cool" };

  ["and.even.this"]: boolean;
}

let complicated = new Complicated();
let itTypeChecks =
  (get(complicated, "justAString.length") ?? 0) +
  (get(complicated, "aNestedObject.stringProp.length") ?? 0) +
  (get(complicated, "aNestedObject.optionalNumberProp") ?? 0) +
  (get(complicated, "and.even.this") ? 42 : -12);

let f = EmberObject.create({
  "waffles.yum": true,
  neato: { potato: "cool cool" } as { potato: string } | undefined,
});

// this *should* error!
let fnl = f.get("neato.potato.length") * 2;
let fnla = (f.get("neato.potato.length") ?? 0) * 2;
let w = f.get("waffles.yum");

// Given an Ember Data model subclass, we can treat `ObjectProxy` as a stand-in
// for things like async relationships (which in fact use `ObjectProxy` under
// the hood to build out `PromiseObject` and `PromiseArray`.)
class SomeModel extends EmberDataModel {
  // imagine these have `@attr('string)` and `@attr('number')` on them
  declare aLocalAttr: string;
  declare anotherLocalAttr: number;

  declare aHasMany: ObjectProxy<
    Array<
      ObjectProxy<{
        baz: ObjectProxy<string>;
      }>
    >
  >;
  declare aBelongsTo: ObjectProxy<AnotherModel>;

  get derived(): number {
    let x =
      this.aBelongsTo.get("itsOwnRelationship.withAnotherAttr.length") ?? 0;

    return aLocalAttr?.length ?? 0;
  }
}

declare class AnotherModel extends EmberDataModel {
  itsOwnAttr?: number;
  itsOwnRelationship: ObjectProxy<YetAnotherModel>;
}

declare class YetAnotherModel extends EmberDataModel {
  withAnotherAttr?: string;
}

// Now, given these "relationships" on a model, we can see all of the patterns
// working we would expect from Ember. Again: play around with this and see what
// kinds of errors you get, how autocompletion works, etc.!
declare let someModel: SomeModel;
get(someModel, "aHasMany").map((item) => get(item, "baz").length);

let l = get(someModel, "aLocalAttr.length");
let x = get(someModel, "aHasMany").map((item) => get(item, "baz").length * 2);
let y = get(someModel, "aBelongsTo.itsOwnRelationship.withAnotherAttr.length");

let { aBelongsTo, aLocalAttr } = getProperties(
  someModel,
  "aBelongsTo",
  "aLocalAttr"
);

// SUMMARY: while we hopefully won't need these *long*-term, and while they will
// likely be opt-in when we release them (since they do have some costs and
// overhead), these advanced types close the last remaining gap
