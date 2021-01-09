import { EmberObject, get, ObjectProxy } from "."; // demo source code!

class DemoSimplest {
  bar?: string;
}

const simplest = new DemoSimplest();
const doubleLen = (get(simplest, "bar.length") ?? 0) * 2; // 🎉

// FAKE EmberObject
class EmberExample extends EmberObject {
  declare someProp: {
    hasNestedValues?: {
      coolCool: string;
    };
  };
}

const example = EmberExample.create({
  someProp: {
    hasNestedValues: {
      coolCool: "yeah",
    },
  },
});

const output = get(example, "someProp.hasNestedValues.coolCool.length");

declare const objectProxy: ObjectProxy<{ wrappingAString: string }>;
let s = get(objectProxy, "wrappingAString.length");
