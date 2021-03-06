usosTip widget
==============

This widget adds a tooltip to the given element, or creates a default "i" icon
with the tooltip.

Screenshot
----------

![Screenshot](http://i.imgur.com/xPpPbKG.png)

Demos
-----

  * [usosTip widget Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.tip)

How to call it
--------------

It can be called as a regular widget:

  * `$("#element").usosTip(options)` - In this case, **it will not create the "i"
    icon**, it will simply add a tooltip to your element. (See below for the
    full list of options.)

Or, using one of the forms of the **static constructor** (these **will** return
the "i" icon):

  * `$.usosWidgets.usosTip.create(options)` - *see the options below!*
  * `$.usosWidgets.usosTip.create(string)` - *HTML!*
  * `$.usosWidgets.usosTip.create(langdict)` - *HTML!*
  * `$.usosWidgets.usosTip.create("Po polsku", "In English")` - *HTML!*
  * `$.usosWidgets.usosTip.create(jQuery_object)`
  * `$.usosWidgets.usosTip.create(function)` - *see the options below!*

Examples
--------

### Simple (static content)

```javascript
$('body').append($.usosWidgets.usosTip.create(
    "Przykładowa treść", "Example content"
));
```

### Content loaded on hover

```javascript
$('body').append($.usosWidgets.usosTip.create({
    content: function() {
        return $.usosCore.usosapiFetch({
            method: 'services/some_service',
            params: {
                item_id: $(this).closest('tr').attr('item_id')
            }
        }).then(function(response) {
            return $("<p>")
                .css('text-color', 'red')
                .text(response.description);
        });
    },
    position: 'left'
}));
```

Options
-------

### content

**Required.** This can be one of:

  * *LangDict object*,
  * *jQuery object*,
  * a string,
  * *a function* - if you want to create/load the content dynamically. The
    function must return a jQuery Promise object which must resolve into
    *LangDict object*, *jQuery object* or *a string*. The function will be
    called once, just before the tooltip is first displayed, in the context
    (`this`) of the jQuery-wrapped tooltip root element.

**Important:** All content must be provided in **HTML format** (not plaintext).
Majority of tips are written by developers, but if you intend to display
user-supplied content you must sanitize it (e.g. with
[$.usosUtils.makeParagraphs](utils.makeParagraphs.md) or with jQuery's
[.text](http://api.jquery.com/text/#text-textString))

### position

*Optional.* Either `left`, `right`, `top` or `bottom`. Default: `top`.

### type

*Optional.* Currently, there are two types of tips:

  * `default` - used in conjunction with the "i" icon. The content can be fairly
    long.

  * `tool` - used on other tool icons or on short paragraphs of text. Has a
    different "look and feel". The content should be rather short (one or two
    paragraphs of text).

### delayed

*Optional.* Default is `false`. If set to `true`, then the showing of the tip
will be additionally delayed (the user needs to hover for a longer period of
time).

### showAs

*Optional.* Default is `auto`. You can use this to change the way the content
is shown. One of the following values:

  * `auto` - jQuery-USOS will attempt to examine the content and decide which
    way is better (these heuristics may change in time).

  * `tooltip` - good for small content; the content will be displayed in a
     tooltip, upon mouse hover or keyboard focus.

  * `dialog` - good for large content; the content will be displayed in a
    separate dialog, upon mouse click, or keyboard activation (by pressing
    Enter or space). The user will be properly instucted. This is used only
    when **type** is set to `default`.
