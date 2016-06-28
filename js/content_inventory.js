function postDisplay(){
	$("#inventory_total").remove();
	$(".inventory_page_left").find("#inventory_pagecontrols").after("<div id='inventory_total' >Total: <span>$"+(total.toFixed(2) || 0.00)+"</span></div><div style='clear: left;'></div>");
	
}
postDisplay();

function preDisplay(){
$("#SIP_options").remove();
$('.inventory_page_left  > div:last').before('<div id="SIP_options"  >'
	+'Price provider: <select id="select_providers" name="provider"><option value="Default">none</option></select>'
	+'</div>');
}

$('.inventory_page_left').on('change','#select_providers', function (e) {
    var optionSelected = $("option:selected", this);
	initDB(invInfo,parseInt(this.value));
});


$('.games_list_tab').click(function(){
	$("#inventory_total").remove();
	$("#SIP_options").remove();
	process();
});



