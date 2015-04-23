$.usosCore.usosapiFetch(options)
================================

Perform an AJAX request to the given USOS API method. This works very similar
to the regular `jQuery.ajax` function. There are lots of options, but usually
you won't need them.

Demos
-----

  * [$.usosCore.usosapiFetch Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.usosapiFetch)

Examples
--------

### Simple usage

```javascript
$.usosCore.usosapiFetch({
    method: 'services/apiref/method_index'
}).done(function(lst) {
    alert(lst.length + " methods found.");
}).fail($.usosCore.panic);
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

### Usage with a syncObject

Non-standard feature. In most cases you don't need syncObjects.

Use case: When designing AJAX searching, you will often want to use
`receiveIncrementalFast`, so that - if you'll receive a response for the
"programmi" query *after* you have already received the response for
"programming" - your handler won't get called.

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


Options
-------

### method

**Required.** The name of the method (starts with `services/`).

### source_id

*Optional.* Use it if you want to use non-default USOS API installation (see
the `usosAPIs` option in [$.usosCore.init](core.init.md)).

### params

*Optional.* Dictionary of all the method parameter values.

The values do *not* have to be strings.

  * All non-string structures will be converted internally to a proper format
    recognized by USOS API (e.g. a pipe-separated list).
  * If any of the values is a `File` object, then all the parameters will be
    posted using the `FormData` object. This is useful for some USOS API methods
    which accept files.

### success / error

*Optional.* Similar to the success/error handlers of the `jQuery.ajax` call.
You should provide these callbacks only if you're using non-default `syncMode`.
Otherwise, **you should make use of the returned *usosXHR* object** (see below).

### syncMode

*Optional.* Useful when you're issuing lots of subsequent queries. One of the
following values:

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
  * `receiveLast`: Five requests are issued (`ABCDE`), but only the last one
    is remembered. Your handler will be called only once, when the response `E`
    is received.

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

*Optional.* If you use any `syncMode` other than `noSync`, then it is **required**.

You should initialize an **empty object** somewhere in your namespace and
provide *the same* object for all calls you want synchronized. Internal format
of this object is left undocumented and may change in the future.

### errorOnUnload

*Optional.* Boolean. By default (`false`), jQuery-USOS will ignore errors caused
by the user navigating away from the page. If you wish to catch such errors,
then set this to `true`.


Returned value
--------------

* If `syncMode` was left at `noSync`, it will return an `usosXHR` object.
* For other modes `syncModes`, nothing will be returned.

usosXHR object
--------------

It implements the **Promise** interface (as `jqXHR` does) and the `abort()`
method. However, it doesn't expose any other `jqXHR` methods - it is
(purposefully) a **subset** of `jqXHR`. You can still get the original `jqXHR`
object, but only via the `fail` method callback.

### .abort()

Aborts the request.

### .always(function() {...})

Part of the *Promise* interface. The callback doesn't take any arguments.

### .done(function(response) {...})

  * Called when USOS API responded with HTTP 200, **and** the response was
    successfully parsed (as JSON).
  * The `response` will contain the parsed USOS API response.

### .fail(function(response) {...})

  * Called whenever the request has failed, for any reason.
  * The `response` will **always be an object**, and it will always contain at
    least the following keys:
    * **message** - a short reason for the error, intended to be read **by
      developers only**.
    * **xhr** - the underlying `jqXHR` object, **extended** with a single extra
      field:
      * **usosapiFetchOptions** - the complete set of parameters used by the
        `usosapiFetch` method in this request.
  * **If any response has been received** from USOS API, then the `response`
    object will contain the parsed USOS API response (plus the `xhr` entry).
  * **If no response has been received** (or the browser did not allow us to
    read the response), then the `response` object will simply contain a "fake"
    messsage (plus the `xhr` entry).
  * If you're not dealing with the errors your self, then you should pass the
    `response` object to `$.usosCore.panic`, or `.usosForms('showErrors', response)`. In many cases, calling the `panic` method will be enough.
  * Note that by default `.fail` will not be triggered if the error occured
    while the page was unloading. See `errorOnUnload` option.
