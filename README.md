jQuery-USOS - USOS plugin for jQuery
====================================

This is a set of jQuery plugins intended to help developers with their work
with USOS API.

Demos
-----

  * [Selector](http://jsfiddle.net/wrygiel/r7eF6/)
  * [Multiselector](http://jsfiddle.net/wrygiel/gNwHa/)
  * [USOS API Fetch](http://jsfiddle.net/wrygiel/qwmu9/)
  * [Context message](http://jsfiddle.net/wrygiel/j2Eu3/)


Installation
------------

  * Make sure you have all the dependencies installed (all of these are
    included in jQuery-USOS repository too):
    * jQuery 1.9.1 (older versions MAY work, but I did not test them),
    * jQuery-UI 1.10.1 (same as above),
    * [jQuery BBQ](http://benalman.com/code/projects/jquery-bbq/docs/files/jquery-ba-bbq-js.html) 1.2.1,
    * [jQuery TextExt](http://textextjs.com/) 1.3.1.
  * Copy `css/jquery.usos` directory to your `css` directory.
  * Copy `js/jquery.usos.1.2.3.min.js` file to your `js` directory.
    * For development, use unminified `js/jquery.usos.*.js` files (include them all).
  * Include CSS and JS file (along with all the dependencies) in your HTML.
  * Advanced usage:
    If your users are not anonymous, then you will probably need to set up your
    own USOS API proxy. The proxy should sign all the incoming USOS API requests
	with your USOS API Consumer Key and your user's Access Token. Make sure
	your proxy is guarded against CSRF attacks.


Core
----

### $.usosCore.init(options)

Before you start working with widgets, you **must** initialize the core by
calling this method. Possible parameters are:

```javascript
$.usosCore.init({

	/** Optional. Language of the interface - "pl" or "en" (default: "en"). */
	langpref: 'en',
	
	/**
	 * Optional. Dictionary of USOS API servers which you want to use. Usually
	 * you will need to define only the "default" key.
	 */
	usosAPIs: {
		'default': {
		
			/**
			 * Required. Where to send the USOS API request? "%s" will be
			 * replaced with the method name.
			 */
			methodUrl: "http://apps.usos.edu.pl/%s"
			
			/**
			 * Optional. Extra parameters to be appended to all issued
			 * requests. This is useful for passing CSRF tokens when you're
			 * using a proxy.
			 */
			extraParams: {}
		}
	}
});
```

### $.usosCore.usosapiFetch(options)

Perform an AJAX request to USOS API method.

```javascript
$.usosCore.usosapiFetch({

	/** Required. The name of the method (starts with "services/"). */
	method: null,

	/** Optional. Use it if you want to use non-default USOS API installation. */
	sourceId: "default",
	
	/** Optional. Parameters of the method. */
	params: {},
	
	/** Optional. Same as in jQuery's .ajax function. */
	success: null,
	
	/** Optional. Same as in jQuery's .ajax function. */
	error: null,

	/**
	 * Optional. Useful when you're issuing lots of subsequent queries.
	 *
	 * By default (syncMode "noSync"), if you issue queries ABCDE and then
	 * receive responses ADBEC, success/error will be fired 5 times with each
	 * of these responses in order.
	 *
	 * If you use syncMode "receiveIncrementalFast", you will get three: ADE.
	 *
	 * If you use syncMode "receiveLast", you will get only one: E.
	 */
	syncMode: "noSync",
	
	/**
	 * If you use any syncMode (other than "noSync"), then this is required.
	 * You should provide an empty object here. You must use *the same* object
	 * for all calls in your "torrent".
	 */
	syncObject: null,
});
```

### $.usosCore.getLangPref()

Returns the current language (the one provided during `$.usosCore.init`).

### $.usosCore.langSelect(...)

Choose an appropriate text based on the current UI language. It might be called
in multiple ways:

  * `$.usosCore.langSelect("Po polsku", "In English")`,
  * `$.usosCore.langSelect(langdict)`, where `langdict` is USOS API's LangDict
    object.
  * `$.usosCore.langSelect(langdict, format)`, where `format` is one of the
    following:
	* `"text"`, when you want the result to be a simple string,
	* `"$span"`, when you want the result to be a jQuery HTML node. In this
	  case, the result may contain additional notes such as `"(in Polish)"` or
	  `"(brak danych)"`.
  * `$.usosCore.langSelect(options)` - you may use this if you need to provide
    even more options. Currently, the options are:
	* `langdict` - as described above, USOS API's LangDict object,
	* `format` - as described above, `"text"` or `"$span"`,
	* `langpref` - `pl`, `en` or `inherit`. Use this if you want to override
	  the language provided during `$.usosCore.init`.

### $.usosCore.console object

Currently undocumented. You should not use it.


Selector widget
---------------

Lets your user search and select one or more USOS entities. You will get a set
of unique entity IDs.

![Example selector widget](http://i.imgur.com/k3wlwEA.png)


### .usosSelector(options)

Create the widget.

```javascript
$('#element').usosSelector({
	
	/* Required. Type of the USOS entity you're interested in. Currently
	 * supported values are: "course", "user" and "faculty". Please note, that
	 * you must use your own USOS API proxy in order to access some entities. */
	entity: null,
	
	/* Optional. Use it if you want to use non-default USOS API installation. */
	sourceId: "default",
	
	/* Optional. Width of the widget. */
	width: "300px",
	
	/* Optional. Set it to true, if you want your user to select more than
	 * one value. */
	multi: false,
	
	/* Optional. If you want the widget to be prefilled, set the ID of an
	 * entity here. In case of multiselectors ('multi' set to true) this should
	 * be a *list* of IDs. */
	value: null
});
```

### .usosSelector('value', [newValue])

Get or set the value of the widget. Format of the value depends on the value of
the **multi** paremeter with which the widget was initialized.

  * If **multi** is `false`, then value is a string or null,
  * If **multi** is `true`, then value is a list.

### .usosSelector('destroy')

Destroy the widget.


Overlays
--------

Overlays module groups methods related to some special UI features. These
features are primarily used by other modules, but you may want to use them
yourself too.

![Example context error overlay](http://i.imgur.com/zaxoyx7.png)

### .usosOverlays('showContextMessage', options)

Show a context message, related to the specific element (usually a form field).

```javascript
$('#element').usosOverlays('showContextMessage', {
	
	/**
	 * Required. Type of the message. Currently, only one value is allowed:
	 * "error". There will be more in the future.
	 */
	type: "error",
	
	/** Required. The message to be displayed (text). */
	message: null,
	
	/**
	 * Optional. Set this to false, if you don't want the browser to scroll
	 * to the message. By default, the browser *will* scroll so that the
	 * message is visible.
	 */
	scrollToBeVisible: true
});
```

### .usosOverlays('hideContextMessage')

Hide previously shown context message.


ApiTable
--------

This widget can display dynamic, sortable, paginated tables based on USOS API
data. In order for all of its functionality to work properly, the underlaying
USOS API method must implement a specific set of parameters (not yet
documented).

**This module is currently undocumented. You should not use it.**

![Example apitable screenshot](http://i.imgur.com/hngxh9J.png)
