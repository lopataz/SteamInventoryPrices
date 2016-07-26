$(document).ready(function(){


var PriceProviders= {};
//////////////////////////////

var searcharray=function(a,r,i){
	var p=a.length;
	for(var j=0;j<p;j++)
		{
		if (a[j][r]==i){ return j;}
		}
	return -1;
};

var htmlEntities = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var changeStatus = function(msg){
  var status = document.getElementById('status');
	status.textContent = msg;
			setTimeout(function() {
			  status.textContent = '';
			}, 1250);
	
};

var initPP = function(PP){
	$('#price_providers').empty();
	for (var key in PP) {
		  if (PP.hasOwnProperty(key) && /^\d+$/.test(key)){
			  $('#price_providers').append("<label class='PP_apps'>"+key+(key in APPID_REF ? " ("+APPID_REF[key]+")":"")+":</label>");
			  
			  var add_pps="";
			  
			  PP[key].providers.forEach(function(provider){
				  add_pps+="<li class='provider' data-request='"+provider.request+"' data-appid='"+key+"' ><span>"+htmlEntities(provider.request)+"</span> <span class='Up'></span> <span class='Down'></span> <span class='del'></span></li>"
			  });
			  
			  if(add_pps !=""){
				$('#price_providers').append("<ul id='PP_"+key+"' class='listPP'>"+add_pps+"</ul>");
			  }else{
				  delete PriceProviders[key];
				  syncPP(function(){
					  initPP(PriceProviders);
				  });
				  break;
			  }
			  
			  
		  }
			
		}
	
};

function syncPP(callback){
	chrome.storage.sync.set({
				"PriceProviders": PriceProviders
			  }, function() {
				  if (callback !== undefined) callback();
			  });
}


// Saves options to chrome.storage
function save_PP() {
  var newPP = document.getElementById('newPP').value;
  if (newPP.match(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)){
  var xhr = new XMLHttpRequest();
	xhr.open("GET", newPP, true);
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
		// JSON.parse does not evaluate scripts.
		var InvPrices;
		try{
			InvPrices = JSON.parse(xhr.responseText);
		}catch(e){
			console.log(e);
		}
		if(InvPrices && "prices" in InvPrices){
			var haschanged=false;
			var tmpPP=PriceProviders;
			for (var appid in InvPrices.prices) {
				if(!/^\d+$/.test(appid)){haschanged=false;break;} 
				if (InvPrices.prices.hasOwnProperty(appid) && typeof InvPrices.prices[appid] === 'object' ){
					var insPP = {"request":newPP};
					if(typeof(InvPrices.name)=="string") insPP.name = InvPrices.name.substring(0,40);
					if(typeof(InvPrices.approvedids)=="object") insPP.approvedids = InvPrices.approvedids.slice(0,64);
					 if(appid in tmpPP && searcharray(tmpPP[appid], "request", newPP)== -1 ){
						tmpPP[appid].providers.push(insPP);
						haschanged=true;
					  }else if(/^\d+$/.test(appid)){
						tmpPP[appid] = {providers:[insPP]};
						haschanged=true;
					  }
					 
				}else if(InvPrices.prices.hasOwnProperty(appid)){
					changeStatus("The price provider structure is broken.");
				}
			}
			if(haschanged){
				PriceProviders = tmpPP;
				syncPP(function(){
					document.getElementById('newPP').value="";
					changeStatus("Successful");
					initPP(PriceProviders);
				});
			}else{
				changeStatus("The price provider structure is broken.");
			}
			
		}else{
			changeStatus("Can't add this Price provider.");
		}
	  }else{
		  changeStatus("The price provider is broken.");
	  }
	}
	xhr.send();
  }else if(newPP!= ""){
	  changeStatus("Please enter a valid url");
  }
}



function restore_options() {
  chrome.storage.sync.get({
    PriceProviders: {} 
  }, function(items) {
	  PriceProviders=items.PriceProviders;
	  initPP(items.PriceProviders);
  });
}


$("#addPP").click(save_PP);

$("#clearCache").click(function(){
	chrome.storage.local.clear();
	changeStatus("Cache cleared!");
	});

$("#resetOptions").click(function(){
	
	var xhr = new XMLHttpRequest();
	var newPP="https://csg0.com/api/defaultProviders.json";
		xhr.open("GET", newPP, true);
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
			// JSON.parse does not evaluate scripts.
			var resp;
			try{
				resp = JSON.parse(xhr.responseText);
			}catch(e){
				console.log(e);
			}
			
			if(resp){
				PriceProviders = resp;
				chrome.storage.sync.set({"PriceProviders": resp });
				initPP(PriceProviders);
			}
			
		}
		}
		xhr.send();	
});
	
$("#price_providers").on("click",".del",function(){
		
		var appid = $(this).closest(".provider").data( "appid" );
		var request = $(this).closest(".provider").data( "request" );
		
		if(appid in PriceProviders){
			var found=-1;
			PriceProviders[appid].providers.forEach(function(provider,index){
					if(provider.request == request){
						found=index;
					}
				});
			if(found>=0){
				localStorage.removeItem(hashString(PriceProviders[appid].providers[found].request, "PP_"));
				PriceProviders[appid].providers.splice(found,1);
				if(PriceProviders[appid].providers.length==0) delete PriceProviders[appid];
					
				syncPP(function(){
					initPP(PriceProviders);
				 });
			}
			
		}else{
			changeStatus("Error");
		}
		
		
});

$("#price_providers").on("click",".Up",function(){
		var appid = $(this).closest(".provider").data( "appid" );
		var request = $(this).closest(".provider").data( "request" );
		
		if(appid in PriceProviders){
			var found=-1;
			PriceProviders[appid].providers.forEach(function(provider,index){
					if(provider.request == request){
						found=index;
					}
				});
			if(found>0){
				var tmpPP = PriceProviders[appid].providers[found];
				PriceProviders[appid].providers[found] = PriceProviders[appid].providers[found-1];
				PriceProviders[appid].providers[found-1] = tmpPP;
				syncPP(function(){
					initPP(PriceProviders);
				 });
			}
			
		}else{
			changeStatus("Error");
		}
		
});

$("#price_providers").on("click",".Down",function(){
		var appid = $(this).closest(".provider").data( "appid" );
		var request = $(this).closest(".provider").data( "request" );
		
		if(appid in PriceProviders){
			var found=-1;
			PriceProviders[appid].providers.forEach(function(provider,index){
					if(provider.request == request){
						found=index;
					}
				});
			if(found<PriceProviders[appid].providers.length-1){
				var tmpPP = PriceProviders[appid].providers[found+1];
				PriceProviders[appid].providers[found+1] = PriceProviders[appid].providers[found];
				PriceProviders[appid].providers[found] = tmpPP;
				syncPP(function(){
					initPP(PriceProviders);
				 });
			}
			
		}else{
			changeStatus("Error");
		}
		
});


	restore_options();
});