$(function() {
	$.usosCore.init({
		langpref: "en"
	});

	// $('#result').text($.usosCore.lang("Po polsku", "In English"));
	// $('#result').text($.usosCore.lang("Po polsku", null));
	// $('#result').text($.usosCore.lang(null, "In English"));
	// $('#result').text($.usosCore.lang(null, null));
	// $('#result').text($.usosCore.lang(null));
	// $('#result').text($.usosCore.lang("Untranslated"));
	
	$('#result').html($.usosCore.lang({
		langdict: {pl: "Po polsku", en: null},
		format: 'jQuery'
	}));
});
