(function($) {
	
	"use strict";
	
	var NS = "usosCore";
	
	var mydata = {
		settings: null
	};
	
	var init = function(options) {
		
		/* Check if previously initialized. */
		
		if (mydata.settings !== null) {
			$.usosCore.console.error("jQuery.usosCore is already initialized! Subsequent calls to init will be ingored!");
			return;
		}
		
		/* Load settings, override with options. */
		
		var defaultSettings = {
			langpref: "en",
			usosAPIs: {
				"default": {
					methodUrl: null,  // e.g. "https://usosapps.usos.edu.pl/%s"
					extraParams: {}
				}
			},
			entityURLs: {
				"entity/users/user": null,
				"entity/fac/faculty": null,
				"entity/slips/template": null
			}
		};
		mydata.settings = $.extend(true, {}, defaultSettings, options);
	};
	
	var usosapiFetch = function() {
		
		var _flatten = function(params) {
			var copy = {};
			$.each(params, function(key, value) {
				if ($.isArray(value)) {
					value = value.join("|");
				} else if (typeof value !== "string") {
					value = "" + value;
				}
				copy[key] = value;
			});
			return copy;
		};
		
		return function(opts) {
			if (typeof opts === "string") {
				/* ALIAS: usosapiFetch(method, params) */
				return usosapiFetch({
					method: arguments[0],
					params: (arguments.length >= 2) ? arguments[1] : {}
				});
			}
			
			var defaultOptions = {
				sourceId: "default",
				method: "method_name",
				params: {},
				syncMode: "noSync",  // "noSync", "receiveIncrementalFast", "receiveLast"
				syncObject: null,
				success: null,
				error: null
			};
			var options = $.extend({}, defaultOptions, opts);
			
			/* Verify params (especially those prone for spelling errors). */
			
			if (options.syncMode == "noSync") {
				if (options.syncObject !== null) {
					throw("syncObject must stay null if syncMode is 'noSync'");
				}
			} else if ((options.syncMode == "receiveLast") || (options.syncMode == "receiveIncrementalFast")) {
				if (options.syncObject === null) {
					throw("syncObject must be an object if syncMode is other than 'noSync'. Check out the docs!");
				}
			} else {
				throw("Invalid syncMode: " + options.syncMode);
			}
			
			/* If the uses a syncObject, then get the new request id. */
			
			var requestId = null;
			if (options.syncObject !== null) {
				if (typeof options.syncObject.lastIssuedRequestId === "undefined") {
					options.syncObject.lastIssuedRequestId = 0;
					options.syncObject.lastReceivedRequestId = 0;
				}
				options.syncObject.lastIssuedRequestId++;
				requestId = options.syncObject.lastIssuedRequestId;
			}
			
			/* Contruct the method URL for the given sourceId and method. */
			
			var url = mydata.settings.usosAPIs[options.sourceId].methodUrl.replace("%s", options.method);
			
			/* Append extraParams (overwrite existing params!) defined for the given sourceId. */
			
			var params = $.extend({}, options.params, mydata.settings.usosAPIs[options.sourceId].extraParams);
			
			/* Make the call. */
			
			var deferred = $.Deferred();
			$.ajax({
				type: 'POST',
				url: url,
				data: _flatten(params),
				dataType: 'json',
				success: function(data, textStatus, jqXHR) {
					if (options.syncObject !== null) {
						if (options.syncObject.lastReceivedRequestId > requestId) {
							
							/* This response is overdue. We already received other response with
							 * greater requestId. We will ignore this response. */
							
							return;
						}
						if (
							(options.syncMode == "receiveLast") &&
							requestId < options.syncObject.lastIssuedRequestId
						) {
							
							/* This response is obolete. A request with greater requestId was
							 * already issued. We will ignore this response. */
							
							return;
						}
						options.syncObject.lastReceivedRequestId = requestId;
					}
					
					if (options.success !== null) {
						options.success(data);
					}
					deferred.resolve(data);
				},
				error: function(xhr, errorCode, errorMessage) {
					if (options.syncObject !== null) {
						if (options.syncObject.lastReceivedRequestId > requestId) {
							/* As above. */
							return;
						}
						options.syncObject.lastReceivedRequestId = requestId;
					}
					
					if (options.error !== null) {
						options.error(xhr, errorCode, errorMessage);
					}
					deferred.reject();
				}
			});
			if (options.syncMode == 'noSync') {
				return deferred.promise();
			}
		};
	}();
	
	var lang = function() {
		if (arguments.length == 1) {
			if (typeof arguments[0].langdict !== 'undefined') {
				/* The default syntax, nothing to "fix". */
			} else if (
				(typeof arguments[0].pl !== 'undefined')
				|| (typeof arguments[0].en !== 'undefined')
			) {
				/* lang(langdict) */
				return lang({
					langdict: arguments[0]
				});
			} else if (arguments[0] === null) {
				/* lang(null) */
				return lang({
					langdict: {pl: null, en: null}
				});
			} else if (arguments[0] == 'pl') {
				/* lang('pl') -> true, is current language is 'pl' */
				return mydata.settings.langpref == 'pl';
			} else if (arguments[0] == 'en') {
				/* lang('en') -> true, is current language is 'en' */
				return mydata.settings.langpref == 'en';
			} else {
				/* lang('Other string') -> warning + 'Other string' */
				$.usosCore.console.warn("$.usosCore.lang called with a single plaintext string!");
				return arguments[0];
			}
		} else if (arguments.length == 2) {
			/* lang(pl, en) */
			return lang({
				langdict: {
					pl: arguments[0],
					en: arguments[1]
				}
			});
		} else if (arguments.length == 0) {
			/* When called without arguments, returns the current language code. */
			return mydata.settings.langpref;
		} else {
			throw("Invalid arguments");
		}
		
		var defaultOptions = {
			langdict: null,
			langpref: "inherit",
			format: "plaintext"
		};
		var options = $.extend({}, defaultOptions, arguments[0]);
		
		if (options.langpref == "inherit") {
			options.langpref = mydata.settings.langpref;
		}
		
		var pl = options.langdict.pl;
		var en = options.langdict.en;
		
		if (options.format == "plaintext") {
			var ret;
			if (options.langpref == 'pl') {
				if (pl) {
					ret = pl;
				} else if (en) {
					ret = "(po angielsku) " + en;
				} else {
					ret = "(brak danych)";
				}
			} else {
				if (en) {
					ret = en;
				} else if (pl) {
					ret = "(in Polish) " + pl;
				} else {
					ret = "(unknown)";
				}
			}
			return ret;
		} else if (options.format == "jQuery") {
			var $ret = $("<span>");
			if (options.langpref == 'pl') {
				if (pl) {
					$ret.html(pl);
				} else if (en) {
					$ret
						.append($("<span>").addClass("ua-note").text("(po angielsku)"))
						.append(" ")
						.append($("<span>").html(en));
				} else {
					$ret.append($("<span>").addClass("ua-note").text("(brak danych)"));
				}
			} else {
				if (en) {
					$ret.html(en);
				} else if (pl) {
					$ret
						.append($("<span>").addClass("ua-note").text("(in Polish)"))
						.append(" ")
						.append($("<span>").html(pl));
				} else {
					$ret.append($("<span>").addClass("ua-note").text("(unknown)"));
				}
			}
			return $ret;
		} else {
			$.usosCore.error("Unknown format " + options.format + ", assuming plaintext.");
			options.format = "plaintext";
			return lang(options);
		}
	};
	
	var _freezeOne = function(arg) {
		if (typeof arg === 'object') {
			return $.extend(true, {}, arg);
		} else {
			return arg;
		}
	};
	var _freezeAll = function(args) {
		var frozen = [];
		for (var i=0; i<args.length; i++) {
			frozen.push(_freezeOne(args[i]));
		}
		return frozen;
	};
	
	/** Wrapper for 'console' object. Deals with http://stackoverflow.com/questions/4057440/ */
	var fixedConsole = {};
	$.each(["log", "warn", "error", "assert"], function(_, funcName) {
		fixedConsole[funcName] = function() {
			if (window.console && window.console[funcName]) {
				/* We want to call the underlying console with frozen arguments (some
				 * consoles are evaluated lazily), hence the need for ".apply". However,
				 * we cannot use window.console.apply directly in IE8, hence the ".call". */
				Function.prototype.apply.call(
					window.console[funcName],
					window.console,
					_freezeAll(arguments)
				);
			}
		};
	});
	
	/**
	 * Filter the fields inside the object based on the given fields description
	 * (in the same format as in the USOS API "fields" parameter). Log an error
	 * if required field is not found (used for deep-checking required
	 * parameters).
	 * 
	 * Example:
	 * filterFields({a: {b: 3, c: 2}, b: 1, c: 1}, "a[c]|c") -> {a: {c: 2}, c: 1}.
	 */
	var filterFields = function() {
		
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
							$.usosCore.console.error("Required field " + dfsPath.join(".") + " not found.");
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
	
	/**
	 * Display a "panic screen". This should be called when unrecoverable errors
	 * are encountered. The user is advised to refresh the screen, contact the
	 * administrators etc.
	 */
	var panic = function(options) {
		
		var settings = $.extend({}, {
			message: {
				pl: "Wystąpił niespodziewany błąd.",
				en: "Unexpected error occured."
			},
			adviseRefreshing: null, // true, false or null (null = "auto")
			adviseRepeating: null,
			adviceCheckingPermissions: null,
			adviseContactingAdmins: null
		}, options);
		
		var $msg = $("<div class='ua-paragraphs ua-container'>");
		$msg.append($("<p style='font-size: 120%; margin-bottom: 25px'>")
			.append($("<b>")
				.html($.usosCore.lang(settings.message))
			)
		);
		var $ul = $("<ul>");
		$msg.append($ul);
		if (settings.adviseRefreshing !== false) {
			$ul.append($("<li>")
				.html($.usosCore.lang(
					"<p><b>Najpierw spróbuj odświeżyć stronę.</b> Odwieżenie strony często może pomóc, " +
					"np. jeśli błąd jest spowodowany automatycznym wylogowaniem po dłuższej nieaktywności.</p>" +
					"<p style='font-size: 120%; margin-bottom: 18px'><a>Kliknij tutaj, aby odświeżyć stronę</a></p>",
					
					"<p><b>First, try to refresh the page.</b> Refreshing can often help, particularly " +
					"if the error occured due to an automatic user sign-out after a prolonged period of " +
					"inactivity.</p><p style='font-size: 120%; margin-bottom: 18px'><a>Click here to refresh the page</a></p>"
				))
				.each(function() {
					$(this).find('a')
						.addClass('ua-link')
						.click(function() {
							window.location.reload(true);
						});
				})
			);
		}
		if (settings.adviseRepeating !== false) {
			$ul.append($("<li>").html($.usosCore.lang(
				"Spróbuj ponownie wykonać akcję, która spowodowała wystąpienie błędu. Być może był " +
				"to jednorazowy błąd spowodowany chwilową utratą połączenia z Internetem?",
				
				"Try to repeat the action which you were doing when the error occured. Perhaps it was " +
				"a one-time network error caused by bad Internet connection?"
			)));
		}
		if (settings.adviceCheckingPermissions !== false) {
			$ul.append($("<li>").html($.usosCore.lang(
				"Upewnij się, czy posiadasz odpowiednie uprawnienia. Czy jesteś zalogowany? " +
				"Być może musisz uzyskać pewne dodatkowe uprawnienia, aby móc wyświetlić stronę " +
				"lub wykonać akcję, którą właśnie próbowałeś wykonać?",
				
				"Make sure you have proper privileges. Are you signed in? Perhaps, you need to " +
				"acquire some special privileges before you can view this page or perform this action?"
			)));
		}
		if (settings.adviseContactingAdmins !== false) {
			$ul.append($("<li>").html($.usosCore.lang(
				"Jeśli problem będzie się powtarzał, to skontaktuj się z administratorem. Napisz " +
				"na której stronie i w którym momencie problem wystąpuje, tak aby administrator " +
				"mógł go dokładniej zbadać.",
				
				"If the problem persists, contact the administrator. Try to include detailed " +
				"descriptions of where and when the error occurs, so that the administrator " +
				"will be able to examine it closely."
			)));
		}
		
		$msg.append($("<p style='text-align: center; font-size: 120%; margin-top: 20px'>")
			.html($("<a class='ua-link'>")
				.html($.usosCore.lang("Zamknij i kontynuuj", "Close and continue"))
				.click(function() {
					$msg.dialog('close');
				})
			)
		);
		
		var showIt = function() {
			$msg.dialog({
				dialogClass: "ua-panic-dialog",
				resizable: false,
				modal: true,
				width: "600px",
				height: "auto",
				closeText: $.usosCore.lang("Zamknij", "Close")
			});
		};
		
		/* The timeout is tempoarary. Currently, panic is often fired when AJAX
		 * requrests are being cancelled because the user is nevigating away. We
		 * don't want the user to see a panic screen in such case, so we'll wait
		 * for the navigation to complete. This can be fixed by catching the
		 * AJAX error and interpretting it appropriately. */
		
		setTimeout(showIt, 2000);
	};
	
	var makeParagraphs = function(s) {
		var pars = s.split(/[\r\n]{2,}/);
		var $result = $("<div>");
		$.each(pars, function(_, par) {
			$result.append($("<p>").text(par));
		});
		return $result.children();
	};
	
	$[NS] = {
		_getSettings: function() { return mydata.settings; },
		init: init,
		usosapiFetch: usosapiFetch,
		lang: lang,
		console: fixedConsole,
		filterFields: filterFields,
		panic: panic,
		makeParagraphs: makeParagraphs
	};
	
})(jQuery);
