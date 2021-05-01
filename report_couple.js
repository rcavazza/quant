const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'INSERT YOUR APIKEY',
  APISECRET: 'INSERT YOUR APISECRET'
});


var args = process.argv.slice(2);
console.log(args);
let cutId = 0;
let isUSDT = false;
if(args[0].search('USDT') > 0) {
	cutId = 4;
	isUSDT = true;
}
else {
	cutId = 3;
}
var valName = args[0].slice(cutId * -1);
var tickPrice;
if(isUSDT) {
	tickPrice = 'EURUSDT';
}
else {
	tickPrice = valName+'EUR';
}
var bnbprice = 0;
var credit = 0;

binance.bookTickers(tickPrice, (error, ticker) => {
	if(isUSDT) {
		tickPrice = ticker.askPrice;
		}
	else {
		tickPrice = ticker.bidPrice;
	}
	console.info("prezzo di "+valName+" "+tickPrice);
	binance.bookTickers('BNBEUR', (error, ticker) => {
		console.info("prezzo di BNB "+ticker.bidPrice);
		bnbprice = ticker.bidPrice;
		binance.trades(args[0], (error, trades, symbol) => {
			for(id in trades) {
				console.log('-------------------------- ');
				let commission = 0.0;
				if(trades[id].commissionAsset == 'BNB'){
					commission = trades[id].commission*bnbprice;
					console.log('commissione '+commission);
				}
				if(trades[id].isBuyer == true){
					credit -= (trades[id].qty*trades[id].price)*tickPrice;
				}
				else {
					credit += (trades[id].qty*trades[id].price)*tickPrice;
				}
				credit -= commission;
				if(trades[id].isBuyer) {
					console.log("compro "+trades[id].qty+" "+args[0].slice(0,3)+" a "+(trades[id].qty*trades[id].price)*tickPrice+" euro");
				}
				else {
					console.log("vendo "+trades[id].qty+" "+args[0].slice(0,3)+" a "+(trades[id].qty*trades[id].price)*tickPrice+" euro");
				}
				console.log("INVESTIMENTO "+credit);
			}
		});
	});
});	


