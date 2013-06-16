
# mongo-diff

Component to perform a diff between two objects expressed as MongoDB
operations.

## Example

```js
var diff = require('mongo-diff');

// diff two arrays using set strategy
diff(['a', 'b', 'c'], ['b', 'c', 'a'])

/*
[
  ['pull', 'a'],
  ['push', 'a']
]
*/
```

## Strategies

### auto

```js
diff('a', null)
// [['unset', 1]]

diff(1, 5)
// [['inc', 4]]
```

### val(a, b)

```js
diff.val('a', 'b')
// [['set', 'b']]

diff.val('a', null)
// [['unset', 1]]
```

Expresses differences as `$set` or `$unset`.

### inc(a, b, opts)

```js
diff.inc(5, 8, { interval: 1 })
// [['inc', 1], ['inc', 1], ['inc', 1]]
```

Options:

- `interval` increment interval. If `null` the interval defaults to the
  difference between the numbers (`null`)

Expresses differences between numbers in terms of `$inc` operations.

### ordered_set(a, b)

```js
diff.ordered_set([], ['a']);
// [['push', 'a']]
```

Expresses the difference between arrays as a series of `$pull` / `$push`
operations. Useful to match differences on arrays that are used with
the `$addToSet` MongoDB operation.

## TODO

- More strategies
- Ordered set indexOf should use deep matching for object/array support
