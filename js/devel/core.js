(function($) {
	
	"use strict";
	
	var NS = "usosCore";
	
	var mydata = {
		settings: null
	};
	
	var init = function(options) {
		
		/* Check if previously initialized. */
		
		if (mydata.settings !== null) {
			$.usosCore._console.error("jQuery.usosCore is already initialized! Subsequent calls to init will be ingored!");
			return;
		}
		
		/* Load settings, override with options. */
		
		var defaultSettings = {
			debug: false,
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
			if (arguments[0] === null) {
				/* lang(null) */
				return lang({
					langdict: {pl: null, en: null}
				});
			} else if (typeof arguments[0].langdict !== 'undefined') {
				
				/* Fall out of the if block! */
				
			} else if (
				(typeof arguments[0].pl !== 'undefined')
				|| (typeof arguments[0].en !== 'undefined')
			) {
				/* lang(langdict) */
				return lang({
					langdict: arguments[0]
				});
			} else {
				/* lang(string) */
				return lang(arguments[0], arguments[0]);
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
			wrapper: "simple"
		};
		var options = $.extend({}, defaultOptions, arguments[0]);
		
		if (options.langpref == "inherit") {
			options.langpref = mydata.settings.langpref;
		}
		
		var pl, en, ret;
		
		if (typeof options.langdict !== 'object') {
			pl = options.langdict;
			en = options.langdict;
		} else {
			pl = options.langdict.pl;
			en = options.langdict.en;
		}
		
		if (options.wrapper == "none") {
			if (options.langpref == 'pl') {
				return pl;
			} else {
				return en;
			}
		} else if (options.wrapper == "simple") {
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
		} else if ((options.wrapper == "jQuery.text") || (options.wrapper == "jQuery.html")) {
			var tag, func;
			if (options.wrapper == "jQuery.html") {
				tag = "<div>";
				func = "html";
			} else {
				tag = "<span>";
				func = "text";
			}
			ret = $(tag);
			if (options.langpref == 'pl') {
				if (pl) {
					ret[func](pl);
				} else if (en) {
					ret
						.append($(tag).addClass("ua-note").text("(po angielsku)"))
						.append(" ")
						.append($(tag)[func](en));
				} else {
					ret.append($(tag).addClass("ua-note").text("(brak danych)"));
				}
			} else {
				if (en) {
					ret[func](en);
				} else if (pl) {
					ret
						.append($(tag).addClass("ua-note").text("(in Polish)"))
						.append(" ")
						.append($(tag)[func](pl));
				} else {
					ret.append($(tag).addClass("ua-note").text("(unknown)"));
				}
			}
			return ret;
		} else {
			$.usosCore._console.error("Unknown wrapper " + options.wrapper + ", assuming 'default'.");
			options.wrapper = "default";
			return lang(options);
		}
	};
	
	var fixedConsole = function() {
		
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
		var errorAlertShown = false;
		var fixedConsole = {};
		$.each(["log", "warn", "error", "assert"], function(_, funcName) {
			/** Deals with http://stackoverflow.com/questions/4057440/ */
			fixedConsole[funcName] = function() {
				if (mydata.settings.debug && window.console && window.console[funcName]) {
					
					/* We want to call the underlying console with frozen arguments (some
					 * consoles are evaluated lazily), hence the need for ".apply". However,
					 * we cannot use window.console.apply directly in IE8, hence the ".call". */
					
					Function.prototype.apply.call(
						window.console[funcName],
						window.console,
						_freezeAll(arguments)
					);
					
					if (funcName == "error" && (!errorAlertShown)) {
						errorAlertShown = true;
						alert("There are errors in the jQuery-USOS console.");
					}
				}
			};
		});
		return fixedConsole;
	}();
	
	var panic = function() {
		
		/* Currently, all the settings are hardcoded. */
		
		var settings = {
			message: {
				pl: "Wystąpił niespodziewany błąd.",
				en: "Unexpected error occured."
			},
			adviseRefreshing: null, // true, false or null (null = "auto")
			adviseRepeating: null,
			adviseCheckingPermissions: null,
			adviseContactingAdmins: null
		};
		
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
		if (settings.adviseCheckingPermissions !== false) {
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
		
		/* 
		 * Currently, panic is often fired when AJAX requrests are being
		 * cancelled because the user is nevigating away. We don't want the
		 * user to see a panic screen in such case, so we'll wait for the
		 * navigation to complete.
		 * 
		 * This can be done better, by catching the AJAX error (via the
		 * arguments) and interpretting it appropriately.
		 */
		
		setTimeout(showIt, 2000);
	};
	
	$[NS] = {
		_getSettings: function() { return mydata.settings; },
		_console: fixedConsole,
		
		init: init,
		usosapiFetch: usosapiFetch,
		lang: lang,
		panic: panic
	};
	
})(jQuery);
