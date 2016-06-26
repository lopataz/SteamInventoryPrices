var InvPrices;

var requestPrices = function(url, callback){
	var hashedurl = hashString(url, "PP_");
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
		// JSON.parse does not evaluate scripts.
		InvPrices={};
		try{
			InvPrices = JSON.parse(xhr.responseText);
		}catch(e){
			console.log(e);
		}
		if("prices" in InvPrices){
			InvPrices.laststored = Math.floor(Date.now() / 1000);
			localStorage.removeItem(hashedurl);
			
			var setInvPrices = {};
			setInvPrices[hashedurl]=InvPrices;
			chrome.storage.local.set(setInvPrices, function() {
				if (!chrome.runtime.lastError) {
					
				} else {
					console.error(chrome.runtime.lastError.message);
					console.log("There was an error! local.GET");
				}
			});	
			callback();
		}else{
			console.error("The price provider is broken.");
		}
	  }
	}
	xhr.send();
	
};


var PP;

function initDB(invInfo,index){
	var appid = invInfo[2];
	// chrome.storage.local.clear();
	chrome.storage.sync.get({
		PriceProviders: {} 
	  }, function(items) {
		PP = items.PriceProviders;
	  if(appid in PP && PP[appid].providers.length>0){
			var hashedurl=hashString(PP[appid].providers[index].request, "PP_");
			chrome.storage.local.get(hashedurl, function(data) {
				if (!chrome.runtime.lastError) {
					if(typeof(data[hashedurl]) != "undefined" && Math.floor(Date.now() / 1000) - data[hashedurl].laststored < 3600 ){
						InvPrices=data[hashedurl];
						if("prices" in InvPrices){
							loadPrices(invInfo);
						}else{
							console.error("The price provider is broken.");
						}
					}else{
						requestPrices(PP[appid].providers[index].request, function(){
							loadPrices(invInfo);
						});
						console.log("Prices just updated");
					}
				} else {
					console.error(chrome.runtime.lastError.message);
					console.log("There was an error! local.GET");
				}
			});
		}else{
			// console.log("No Price provider set for app "+appid);
		}
	});
	
}






/// dom ///
var nbTries=0,timeoutTries=10;
var domInv;
function process(){
	
	var tmpdomInv = $("#inventories .inventory_ctn:visible");
	if(tmpdomInv.get(0) !== undefined && ( domInv === undefined || domInv.get(0).id !== tmpdomInv.get(0).id ) && !tmpdomInv.data("SIP") ){
		domInv = tmpdomInv;
		var invInfo = domInv.get(0).id.split("_");
		if(invInfo.length==4){
			nbTries=0;
			initDB(invInfo,0);
		}else{
			nbTries++;
			if(nbTries < 20 * timeoutTries){
				setTimeout(process,50);
			}else{
				nbTries=0;
			}
		}		
	
	}else{
		nbTries++;
			if(nbTries < 20 * timeoutTries){
				setTimeout(process,50);
			}else{
				nbTries=0;
			}
	}
	
}

var rgSortedInventory;
function loadPrices(invInfo){
	var lastLoadedInv=null,found=-1;
	chrome.storage.local.get("lastLoadedInv", function(data) {
		if(typeof(data["lastLoadedInv"]) != "undefined" ){
			lastLoadedInv = data["lastLoadedInv"];
			for(var i=0; i < data["lastLoadedInv"].length; i++){
				if(data["lastLoadedInv"][i].success && data["lastLoadedInv"][i].invInfo.toString() === invInfo.toString()){
					displayPrices(data["lastLoadedInv"][i]);
					found=i;
					break;
				}
			}
			
		}else{
			lastLoadedInv=[];
		}
	});
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://steamcommunity.com/profiles/"+invInfo[1]+"/"+invInfo[0]+"/json/"+invInfo[2]+"/"+invInfo[3], true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			// JSON.parse does not evaluate scripts.
			var Inventory={};
			try{
				Inventory = JSON.parse(xhr.responseText);
			}catch(e){
				console.log(e);
			}
			if("rgInventory" in Inventory){
				Inventory["invInfo"]=invInfo;
				displayPrices(Inventory);
				if(lastLoadedInv && lastLoadedInv !== null ){
					if(found >= 0){
						lastLoadedInv[found]=Inventory;
					}else{
						lastLoadedInv = Array.prototype.slice.call(lastLoadedInv);
						lastLoadedInv.unshift(Inventory);
						lastLoadedInv = lastLoadedInv.slice(0, 4);
					}
					chrome.storage.local.set({"lastLoadedInv" : lastLoadedInv}, function() {
						if (chrome.runtime.lastError) {
							console.error(chrome.runtime.lastError.message);
							console.log("There was an error! local.GET");
						}
					});	
				}
			}
	
		}
	}
	xhr.send();
	
}

function displayPrices(Inv){
	if("rgInventory" in Inv){
				domInv.find('.price2').remove();
				domInv.data( "SIP", true );
				rgSortedInventory = { };
				
				for ( var itemid in Inv.rgInventory )
				{
					var rgItem = Inv.rgInventory[itemid];
					rgSortedInventory[rgItem.pos] = rgItem;
				}
				
				for ( var pos in rgSortedInventory )
				{
					var rgItem = Inv.rgDescriptions[rgSortedInventory[pos].classid+"_"+rgSortedInventory[pos].instanceid];
					
					// add infos
					rgSortedInventory[pos].name = rgItem.market_hash_name || rgItem.market_name || rgItem.name;
					var color =searchasso(rgItem["tags"],"color");
					rgSortedInventory[pos].color = hexToRgb(color===""?"ebebff":color);
					
					// add price to dom
					var domItem="#item"+Inv.invInfo[2]+"_"+Inv.invInfo[3]+"_"+rgSortedInventory[pos].id;
					if(InvPrices.prices && Inv.invInfo[2] in InvPrices.prices && rgSortedInventory[pos].name in InvPrices.prices[Inv.invInfo[2]]){
						var price = InvPrices.prices[Inv.invInfo[2]][rgSortedInventory[pos].name]["median"];
						domInv.find(domItem).prepend("<div class='price2' style='background-color:rgba("+rgSortedInventory[pos].color+",0.70)'>"+(price !== undefined ?"$"+price:"-")+"</div>");
					}	
				}
			}else{
				console.log("Steam might be down");
			}
}


process();






