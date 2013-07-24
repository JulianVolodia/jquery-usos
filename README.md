jQuery-USOS plugin
==================

This is a set of [jQuery](http://jquery.com/) utilities and simple widgets, 
intended to help web developers with their work with
[USOS](http://usos.edu.pl/)-related projects (primarily, the *USOSweb* project).
If you don't know what *jQuery* and *USOS* are, then you're in a wrong place!

*jQuery-USOS* has strong connections to
[USOS API](http://apps.usos.edu.pl/developers/api/). Most of the methods and
widgets require you to use one of the existing USOS API
[installations](http://apps.usos.edu.pl/developers/api/definitions/installations/)
(via [proxy](https://github.com/MUCI/jquery-usos/blob/master/doc/installation.md)).

**WARNING - ALPHA VERSION: the API will change in a backward-incompatible way!**

Demos
-----

  * [usosSelector widget Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/widget.selector)
  * [$.usosCore.usosapiFetch Demo](http://jsfiddle.net/gh/get/jquery/1.9.1/dependencies/migrate,ui/MUCI/jquery-usos/tree/master/jsfiddle-demos/core.usosapiFetch)
  * You will find *much* more demos in the API section.

Versioning and backward compatibility
-------------------------------------

  * **Versions 0.x.y** (alpha versions) are **NOT** backward compatible.
  * Starting from **version 1.0**, all stuff which is **documented on GitHub** is
    *planned* to be backward compatible. However:
    * This does **NOT** mean, that future versions of *jQuery-USOS* will
      **look** the same.
    * We'll try to avoid it, but there still can be some backward-incompatible 
      changes. This means, that you may be required to change your code once
      you upgrade your jQuery-USOS library. Especially if you customized things.
    * We will describe backward-incompatible changes in our changelog (to be
      created).
  * **Undocumented stuff** - usually (but not necessarily) prefixed with an 
    underscore (_) - is **private** and it is **NOT**  backward compatible.

**If you want to extend jQuery-USOS:**

  * All new widgets and plugins should pass a
    [proof of concept](https://en.wikipedia.org/wiki/Proof_of_concept#In_Software_Development)
    test before being officially added to *jQuery-USOS*. E.g. they should be
    previously tested in a
    [pilot](https://en.wikipedia.org/wiki/Software_prototyping) project.

Installation
------------

  * [Installation instructions](https://github.com/MUCI/jquery-usos/blob/master/doc/installation.md)

	
API
---
  
### $.usosCore

  * [$.usosCore.init](https://github.com/MUCI/jquery-usos/blob/master/doc/core.init.md) -
    you need to call this before using any other functions.
  * [$.usosCore.usosapiFetch](https://github.com/MUCI/jquery-usos/blob/master/doc/core.usosapiFetch.md) -
    fetch/post data from/to USOS API.
  * [$.usosCore.lang](https://github.com/MUCI/jquery-usos/blob/master/doc/core.lang.md) -
    primary language-helper.
  * [$.usosCore.panic](https://github.com/MUCI/jquery-usos/blob/master/doc/core.panic.md) -
    display a "panic" screen.

### $.usosEntity

  * [$.usosEntity.label](https://github.com/MUCI/jquery-usos/blob/master/doc/entity.label.md) - display a label with the name of an entity.
  * [$.usosEntity.link](https://github.com/MUCI/jquery-usos/blob/master/doc/entity.link.md) - display a link pointing to an entity.
  * [$.usosEntity.url](https://github.com/MUCI/jquery-usos/blob/master/doc/entity.url.md) - get an URL of entity's home page.

### $.usosUtils

  * [$.usosUtils.makeParagraphs](https://github.com/MUCI/jquery-usos/blob/master/doc/utils.makeParagraphs.md) - sanitize multi-line user-supplied input.
  * [$.usosUtils.requireFields](https://github.com/MUCI/jquery-usos/blob/master/doc/utils.requireFields.md) - verify signatures of complex input objects.

### $.usosWidgets

  * [usosSelector widget](https://github.com/MUCI/jquery-usos/blob/master/doc/widget.selector.md) - search for an entity and get its ID.
  * [usosNotice widget](https://github.com/MUCI/jquery-usos/blob/master/doc/widget.notice.md) - display notices or errors on form elements.
  * [usosTip widget](https://github.com/MUCI/jquery-usos/blob/master/doc/widget.tip.md) - display "info" icon with a message on hover.
  * [usosProgressOverlay widget](https://github.com/MUCI/jquery-usos/blob/master/doc/widget.progressOverlay.md) - display a progress indicator over an element.

*Note:* All widgets are [jQuery-UI widgets](http://api.jqueryui.com/jQuery.widget/).


<!--

ApiTable
--------

This widget can display dynamic, sortable, paginated tables based on USOS API
data. In order for all of its functionality to work properly, the underlaying
USOS API method must implement a specific set of parameters (not yet
documented).

**This module is currently undocumented. You should not use it.**

![Example apitable screenshot](http://i.imgur.com/hngxh9J.png)
-->