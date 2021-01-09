// Fully and robustly type-safe types for Ember's `get` and `set` helpers!

/** Given `Join<"a", "b">`, produces the type `"a.b"` */
type Join<K extends string, L extends string> = `${K}.${L}`;

/**
 * Given an object `T`, determine all the allowed paths within it, including
 * top-level keys and nested keys.
 *
 * For example, given this object:
 *
 * ```ts
 * interface Nested {
 *   top: {
 *     middle: {
 *       bottom: string;
 *     }
 *   }
 * }
 * ```
 *
 * Then `AllKeys<Nested>` will be `"top" | "top.middle" | "top.middle.bottom"`.
 *
 * **NOTE:** for arbitrarily-complex objects, this may be *very* expensive. It
 * has to recurse every possible path on the key to build up the final list of
 * paths, which may itself produce a very large union which will then be input
 * to *other* type-level functions.
 */
// prettier-ignore
export type AnyPathIn<
  T extends unknown,
  K extends keyof Unproxied<T> = keyof Unproxied<T>
> = K extends string
  ? | K
    | (Unproxied<T>[K] extends infer U | null | undefined
      ? Join<K, AnyPathIn<U>>
      : Join<K, AnyPathIn<Unproxied<T>[K]>>)
  : never;

// Utility type which performs the actual recursive logic for `PropType`, so
// that `PropType` can just handle the top-level dispatch of nullable vs.
// non-nullable types *into* the `Inner` handler.
// prettier-ignore
type Inner<T, Path extends string> =
  string extends Path ? unknown :
  Path extends keyof Unproxied<T> ? Unproxied<Unproxied<T>[Path]> :
  Path extends `${infer K}.${infer R}` ?
    K extends keyof Unproxied<T>
    ? PropType<Unproxied<T>[K], R>
    : unknown
  : unknown;

/**
 * Given a type `T` and a `Path` which is a string, look up the nested value for
 * the path.
 *
 * For example, given an object like this:
 *
 * ```ts
 * interface Nested {
 *   top: {
 *     middle: {
 *       bottom: string;
 *     }
 *   }
 * }
 * ```
 *
 * we can get the type of `bottom`:
 *
 * ```ts
 * type Bottom = PropType<Nested, 'top.middle.bottom'>;
 * ```
 *
 * Here `Bottom` will be a `string`.
 */
// prettier-ignore
export type PropType<T, Path extends string> =
  T extends null | undefined
    ? Inner<NonNullable<T>, Path> | undefined
    : Inner<T, Path>;

// We can now define type-safe versions of Ember's `get` and `set` helpers!
// These have the *exact* same semantics as those do, but are type-safe and will
// provide completions.
export declare function get<T, K extends AnyPathIn<T>>(
  obj: T,
  path: K
): PropType<T, K>;

type PropsIn<T, K extends AnyPathIn<T>> = Pick<{ [P in K]: PropType<T, P> }, K>;

export declare function getProperties<T, K extends AnyPathIn<T>>(
  obj: T,
  paths: K[]
): PropsIn<T, K>;
export declare function getProperties<T, K extends AnyPathIn<T>>(
  obj: T,
  ...paths: K[]
): PropsIn<T, K>;

export declare function set<T, P extends AnyPathIn<T>>(
  obj: T,
  path: P,
  value: PropType<T, P>
): PropType<T, P>;

export declare function setProperties<
  T,
  Keys extends AnyPathIn<T>,
  Props extends Partial<{ [K in Keys]: PropType<T, K> }>
>(obj: T, properties: Props): Props;

// The real `ObjectProxy` in Ember is a bit more complicated than this, but this
// will do to get the idea across. It has `get` and `set` methods on it which
// allow you to deeply get or set items which may or may not have been proxied
// (just as the real `Ember.get` and `Ember.set` methods do, and using the same
// means as the `get` above does).
export interface ObjectProxy<T> {
  get<K extends AnyPathIn<T>>(key: K): PropType<T, K>;
  set<K extends AnyPathIn<T>>(key: K, value: PropType<T, K>): void;
}

// Utility type that gives us the result of whatever is wrapped in an
// `ObjectProxy` as defined above.
type Unproxied<T> = T extends ObjectProxy<infer U> ? U : T;

export declare class EmberObject {
  get<K extends AnyPathIn<this>>(key: K): PropType<this, K>;
  // get(key: string): unknown;

  static create<T extends object>(props: T): EmberObject & T;
}

// This is a "pretend" version of the `@ember-data/model` class, with everything
// stripped away except that it has an `id` on it.
export declare class EmberDataModel extends EmberObject {
  id: string;
}
