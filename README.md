# Ember's `get` and `set` implemented with TS 4.1 template types

This is just a demo of how we can implement robust types for Ember's `get` and `set` functions (which could be used as a model for other libraries like lodash as well).

![demo of deep autocompletion on an `EmberObject`](./demo.png)

This correctly handles a number of significant "edge cases" over the base example shown in the original PR adding this feature to TS and the blog post announcement:

- If any type in the path is `null | undefined`, this approach resolves the final type to include that correctly. For example, given an item `foo: { bar?: string }`, doing `get(foo, 'bar.length')` will have the type `number | undefined`, since `bar` may be undefined.

- Ember's classic `ObjectProxy` type is unwrapped correctly along the way. This means that places where you *have* to use `get` in Ember today (for example, async relationships on Ember Data models) can be correctly unwrapped by this implementation.

- Autocompletion works for the string keys as well. Given `foo: { bar: { baz: string } }`, typing `get(foo, '` and triggering auto completion, manually or automatically, will show `bar` and `bar.baz`. (The only downside here is that it will *also* show all the properties on any given suggestion, e.g. `bar.baz.length` and `bar.baz.indexOf` and so on.)

_**Note:** This is definitely only prototype code at the moment._ There are no type tests, and there are many gaps, and the demos with `ObjectProxy` and similar here are just that: demos, which do not use the actual types from Ember. However, the demo *does* represent a good future direction, and proves that we can support at least the vast majority of use cases for Ember going forward.

There are still gaps here, too. For example, `this.get` does *not* complete correctly. (We can likely work around this in some way or another, but still be figured out.)

