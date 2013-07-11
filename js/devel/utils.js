(function($) {
	
	"use strict";
	
	var NS = "usosUtils";
	
	/**
	 * Filter the fields inside the object based on the given fields description
	 * (in the same format as in the USOS API "fields" parameter). Log an error
	 * if required field is not found (used for deep-checking required
	 * parameters).
	 * 
	 * Example:
	 * requireFields({a: {b: 3, c: 2}, b: 1, c: 1}, "a[c]|c") -> {a: {c: 2}, c: 1}.
	 */
	var requireFields = function() {
		
		/**
		 * Check if given path is defined within an object and return the value
		 * stored at this path. E.g. within:
		 *   {a: {b: 3, c: 2}}
		 * four paths are defined:
		 *   [], ["a"], ["a", "b"], ["a", "c"].
		 */
		var _getPath = function(obj, path) {
			var ref = obj;
			$.each(path, function(_, e) {
				ref = ref[e];
				if (typeof ref === "undefined")
					return ref;
			});
			return ref;
		};
		
		/**
		 * Store the value at the given path within the obj.
		 */
		var _setPath = function(obj, path, value) {
			var ref = obj;
			var last = path.length - 1;
			$.each(path, function(i, e) {
				if (i == last) {
					ref[e] = value;
				} else {
					if (typeof ref[e] === "undefined") {
						ref[e] = {};
					}
					ref = ref[e];
				}
			});
		};
		
		return function(obj, fieldsDesc) {
			var newObj = {};
			var dfsPath = [];
			var field = "";
			var s = fieldsDesc + "$";
			for (var i=0; i<s.length; i++) {
				var c = s.charAt(i);
				if (c == "[" || c == "]" || c == "|" || c == "$") {
					dfsPath.push(field);
					var x = null;
					if (field !== "") {
						x = _getPath(obj, dfsPath);
						if (typeof x === "undefined") {
							$.usosCore._console.error("Required field " + dfsPath.join(".") + " not found.");
						}
					}
					if (c == "[") {
						// nothing!
					} else if (c == "|" || c == "$") {
						if (field !== "") {
							_setPath(newObj, dfsPath, x);
						}
						dfsPath.pop();
					} else if (c == "]") {
						if (field !== "") {
							_setPath(newObj, dfsPath, x);
						}
						dfsPath.pop();
						dfsPath.pop();
					}
					field = "";
				} else {
					field += c;
				}
			}
			return newObj;
		};
	}();

	var makeParagraphs = function(s) {
		var pars = s.split(/[\r\n]{2,}/);
		var $result = $("<div>");
		$.each(pars, function(_, par) {
			$result.append($("<p>").text(par));
		});
		return $result.children();
	};
	
	/**
	 * Convert a content parameter (passed as the "content" option to various
	 * jQuery-USOS functions and widgets) to HTML string, suitable to be used
	 * as content for tooltipster.
	 * 
	 * Currently, tooltipster is used by various other plugins, that's why this
	 * needs to be put in the utils module.
	 */
	var _tooltipster_html = function(obj) {
		
		var $content;
		
		/* Convert obj to jQuery element. */
		
		if (obj instanceof $) {
			/* jQuery elementset */
			$content = obj;
		} else {
			$content = $.usosCore.lang({
				langdict: obj,
				format: "jQuery-HTML"
			});
		}
		
		/* Tooltips should not be too wide. We need to guess a proper max-width
		 * for the given content. We'll use simple heuristics, based on the
		 * length of the text given. */
		
		var len = $content.text().length;
		var maxWidth;
		if (len < 30) {
			maxWidth = "auto";
		} else if (len < 300) {
			maxWidth = "300px";
		} else if (len < 1200) {
			/* We don't want it to be too high, so it is better to make it wider. */
			var scale = 1.0 - ((1200 - len) / 900.0);
			maxWidth = (300 + 300 * scale) + "px";
		} else {
			maxWidth = "600px";
		}
		return $("<div>")
			.append($("<div>")
				.append($content)
				.css("max-width", maxWidth)
			)
			.html();
	};
	
	$[NS] = {
		_tooltipster_html: _tooltipster_html,
		
		requireFields: requireFields,
		makeParagraphs: makeParagraphs
	};
	
})(jQuery);
