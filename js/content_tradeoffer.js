
	
$("#trade_total_yours").remove();
$("#trade_total_theirs").remove();
$("#trade_yours .trade_item_box").after("<div id='trade_total_yours' class='trade_total' >Total: <span>$0.00</span></div><div style='clear: right;'></div>");
$("#trade_theirs .trade_item_box").after("<div id='trade_total_theirs' class='trade_total' >Total: <span>$0.00</span></div><div style='clear: right;'></div>");

function postDisplay(){
	recalcTotal($("#trade_yours"));
	recalcTotal($("#trade_theirs"));
	}

function checkTheirs(){
	var testitem = $("#their_slots").find(".item").find("a").attr("href");
	if(typeof(testitem) == "string"){
		var invVals = testitem.match(/steamcommunity.com\/(.*)\/(.*)\/(.*)\/#([\d]+)_([\d]+)/i);
		if(invVals.length ==6)
			loadPrices([invVals[3], invVals[2], invVals[4], invVals[5], invVals[1] , true]);
	}
}

$(document).ready(function(){
	setTimeout(checkTheirs,1000);
});


function preDisplay(){
$("#SIP_options").remove();
$('.trade_left').append('<div id="SIP_options">'
	+'<h2>Price options:</h2>'
	+'<div class="price_box"><div class="price_box_area">'
	+'Price provider: <select id="select_providers" name="provider"><option value="Default">none</option></select>'
	/*+'<br/>Price type: <select name="price_type"><option value="median">Median Sold</option><option value="lowest">Lowest on market</option></select>'*/
	+'</div></div>'
	+'</div>');
}

$('.trade_left').on('change','#select_providers', function (e) {
    var optionSelected = $("option:selected", this);
	initDB(invInfoBase,parseInt(this.value));
});
	
function recalcTotal(selector){
	var tmptotal=0;
	selector.find(".item").each(function(index){
		tmptotal+= ( (price = $( this ).find(".price2").data("price")) !== undefined?parseFloat(price):0);
	});
	selector.find(".trade_total span").text("$"+tmptotal.toFixed(2));
}
	
	
var target1 = document.querySelector('#your_slots');
var target2 = document.querySelector('#their_slots');
var observer = new WebKitMutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
		if(mutation.type == "childList" && mutation.target.className == "slot_inner"){
			/*console.log("Success");
			console.log(mutation);*/
			if($.contains( target1, mutation.target )){
				recalcTotal($("#trade_yours"));
			}else{
				recalcTotal($("#trade_theirs"));
			}
			
			
		}
      
    });    
});
observer.observe(target1, { attributes: false, childList: true, characterData: false, subtree: true });
observer.observe(target2, { attributes: false, childList: true, characterData: false, subtree: true });


$('#appselect_you_options').click(process);
$('#appselect_them_options').click(process);

$('#inventory_select_your_inventory').click(process);
$('#inventory_select_their_inventory').click(process);






