$.usosCore.usosapiFetch(options)
================================

Perform an AJAX request to USOS API method. This works very similar to the
regular `jQuery.ajax` function. There are lots of options, but usually you
won't need them.

Options
-------

### method

Required. The name of the method (starts with `services/`).

### sourceId

Optional. Use it if you want to use non-default USOS API installation (see
the usosAPIs option in [$.usosCore.init](core.init.md)).

### params

Dictionary of all the method parameter values. The values **don't** have to be
strings. All complex structures will be converted internally to a proper
format recognized by USOS API.

### success / error

These work the same as in `jQuery.ajax` call.

### syncMode

This is an extra addition. You don't have it in `jQuery.ajax` call. Useful when
you're issuing lots of subsequent queries.

One of the following values:

  * `noSync` (default)
  * `receiveIncrementalFast`,
  * `receiveLast`.

If you call `usosapiFetch` five times in a row (in the `ABCDE` order), then:

  * `noSync` (default): Five requests are issued (`ABCDE`), then your success
    (or error) handler will be called five times, in order in which the responses
    are received (for example, `BDAEC`).
  * `receiveIncrementalFast`: Five requests are issued (`ABCDE`), but your
    handler is called only if the response if "newer" than previously handled
    response. If responses are received in the `BDAEC` order, then your handler
    will be called three times only: `BDE`
  * `receiveLast`: This will wait for the response of the request which was issued
    last. Your handler will be called only once, when the response `E` is received.

<!--

TODO: Other options to be (possibly) implemented in the future:
- "receiveIncremental": [2] =ABCDE= [3] =ABCDE=
- "sendIncremental": Same as above, but B is issued after the response
  to A is received and handled (may take much more time!):
  [2] =ABCDE= [3] =ABCDE=
- "sendLast": B-D are not issued at all. E is issued after the response
  to A is received and handled: [2] =AE= [3] =AE=
- "sendAndReceiveLast": This behaves like "receiveLast" and "sendLast"
  together: [2] =AE= [3] =E=.

-->

### syncObject

If you use any `syncMode` other than `noSync`, then this is required.
You should initialize an **empty object** somewhere in your namespace and
provide *the same* object for all calls you want synchronized. Internal format
of this object is left undocumented and may change in the future.

Returned value
--------------

If `syncMode` was left at `noSync`, it will return jQuery Promise object
(as the regular `jQuery.ajax` would do). For other `syncMode`s, nothing
will be returned.

Examples
--------

### Simple usage

Note that `params` is optional.

```javascript
$.usosCore.usosapiFetch({
    method: 'services/apiref/method_index'
}).done(function(lst) {
    alert(lst.length + " methods found.");
}).fail($.usosCore.panic);
```

### Usage with a `syncObject`.

In case of AJAX searching you will often want to use `receiveIncrementalFast`,
so that - if you'll receive a response for the "programmi" *after* you have
already received the response for "programming" - your handler won't get called.

```javascript
var syncObject = {};
// ...
$someInput.change(function() {
    $.usosCore.usosapiFetch({
        method: 'services/courses/search',
        params: {
            name: $someInput.val(),
            fac_id: "10000000",
            fac_deep: true
        },
        success: mySuccessHandler,
        error: myErrorHandler,
        syncMode: "receiveIncrementalFast",
        syncObject: syncObject,
    });
});
```

### Deferred chaining

As in `jQuery.ajax`, you can chain the calls, etc.

```javascript
// This will issue three simultaneous requests
var prerequisite1 = $.usosCore.usosapiFetch({ /* ... */ });
var prerequisite2 = $.usosCore.usosapiFetch({ /* ... */ });
var prerequisite3 = $.usosCore.usosapiFetch({ /* ... */ });
$.when(prerequisite1, prerequisite2, prerequisite3)
    .then(function(result1, result2, result3) {
        return result1 + result2 + result3;
    })
    .then(function(sum) {
        // This will be issued after all prerequsites are fetched and processed.
        return $.usosCore.usosapiFetch(/* ... */);
    })
    .then(function() {
        alert("Done!");
    })
    .fail($.usosCore.panic);
```
