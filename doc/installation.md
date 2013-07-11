Installation instructions
=========================

Pretty standard. You just have to include all JS and CSS files in your page.

Files to include
----------------

### Dependencies

  * jQuery 1.9.1,
  * jQuery-UI 1.10.1 (theme included),
  * Plugins (included in the `jquery-usos-x.y.z-bundle.min.js`):
    * [BBQ](http://benalman.com/code/projects/jquery-bbq/docs/files/jquery-ba-bbq-js.html) 1.2.1,
    * [TextExt](http://textextjs.com/) - *modified* 1.3.1 version (our version differs from the official one!),
    * [colResizable](http://quocity.com/colresizable/) 1.3.
  * and, of course, jQuery-USOS itself (if you're not using the bundle package).

### Options to consider

  * You may use `js/jquery-usos-x.y.z-bundle.min.js` if you want to
    fetch jQuery-USOS *and* all the required plugins in one request (this does *not*
    include jQuery nor jQuery-UI).
  * For development, you can use `js/devel/*.js` files and unminified plugin
    versions. There are many of them and they are heave, remember to use this
	for development only!

USOS API Proxy
--------------

You will probably also need to set up your own USOS API proxy (and point to it
when calling [$.usosCore.init](https://github.com/MUCI/jquery-usos/blob/master/doc/core.init.md#usosapis).

### Why?

USOS API is using OAuth 1.0, which does not provide a JavaScript flow.
That means that jQuery-USOS cannot handle OAuth on itself. You will
need to set up USOS API proxy if you need to access **non-anonymous** methods.

### Some guidelines

  * The proxy should sign all incoming USOS API requests with your USOS API
    Consumer Key and (optionally) your user's Access Token.
  * If you have an Administrative Consumer Key, then you can usually use
    `as_user_id` parameter with ID extracted from your `$_SESSION`.
  * Your proxy should be guarded against CSRF attacks (especially if you're an
    administrative consumer!).
  * If needed, we may provide a code sample.
 