
exports.stripHtml = function(html) 
{
	return html.replace(/<(?:.|\n)*?>/gm, '');
};
