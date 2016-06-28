
var searchasso = function(a,r){
	var p = "";
	for(var j=0;j<a.length;j++)
	{
		if (a[j][r]!== undefined){ p=a[j][r];}
	}
	
	return p;
};

var hexToRgb = function(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

	return { r:r, g:g, b:b, luma: 0.2126 * r + 0.7152 * g + 0.0722 * b, rgb: r + "," + g + "," + b };
    // return r + "," + g + "," + b;
};

var hashString = function(str, prefix){
	var hash = 0;
	if (str.length == 0) return hash;
	for (var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+c;
		hash = hash & hash; // Convert to 32bit integer
	}
	if (hash < 0) hash = 0xFFFFFFFF + hash + 1;
	hash = hash.toString(16).toUpperCase();
	if (typeof(prefix) == "string") hash=prefix+hash;
	return hash;
};

