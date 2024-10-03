const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
const dayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];

const dateEt = function(){
	let timeNow = new Date();
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	let dateNowEt = dateNow + ". " + monthNamesEt[monthNow] + " " + yearNow;
	return dateNowEt;
}

const weekDay = function(){
	let timeNow = new Date();
	let dayNow = timeNow.getDay();
	return dayNamesEt[dayNow];
}

const timeEE = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	return hourNow + ":" + minuteNow + ":" + secondNow;
}

const partOfDay=function(){
	let timeNow=new Date();
	//esmaspaev
	if (timeNow.getDay()==1){
		day="argipäev";
	}
	if (timeNow.getDay()==1 && timeNow.getHours()>=14 && timeNow.getHours()<20){
		dayPart="kooliaeg";
	}
	if (timeNow.getDay()==1 && (timeNow.getHours()>=20 && timeNow.getHours()<23)||(timeNow.getHours()>=10 && timeNow.getHours()<14)){
		dayPart="kooliväline aeg";
	}
	if (timeNow.getDay()==1 && timeNow.getHours()>=23 || timeNow.getHours()<10){
		dayPart="uneaeg";
	}
	//teisipaev
	if (timeNow.getDay()==2){
		day="argipäev";
	}
	
	if (timeNow.getDay()==2 && timeNow.getHours()>=8 && timeNow.getHours()<18){
		dayPart="kooliaeg";
	}
	if (timeNow.getDay()==2 && (timeNow.getHours()>=18 && timeNow.getHours()<23)||(timeNow.getHours()>=6 && timeNow.getHours()<8)){
		dayPart="kooliväline aeg";
	}
	if (timeNow.getDay()==2 && timeNow.getHours()>=23 || timeNow.getHours()<6){
		dayPart="uneaeg";
	}
	//kolmapaev
	if (timeNow.getDay()==3){
		day="argipäev";
	}
	
	if (timeNow.getDay()==3 && timeNow.getHours()>=12 && timeNow.getHours()<18){
		dayPart="kooliaeg";
	}
	if (timeNow.getDay()==3 && (timeNow.getHours()>=18 && timeNow.getHours()<23)||(timeNow.getHours()>=10 && timeNow.getHours()<12)){
		dayPart="kooliväline aeg";
	}
	if (timeNow.getDay()==3 && timeNow.getHours()>=23 || timeNow.getHours()<10){
		dayPart="uneaeg";
	}
	//neljapäev
	if (timeNow.getDay()==4){
		day="argipäev";
	}
	
	if (timeNow.getDay()==4 && timeNow.getHours()>=12 && timeNow.getHours()<16){
		dayPart="kooliaeg";
	}
	if (timeNow.getDay()==4 && (timeNow.getHours()>=16 && timeNow.getHours()<23)||(timeNow.getHours()>=10 && timeNow.getHours()<12)){
		dayPart="kooliväline aeg";
	}
	if (timeNow.getDay()==4 && timeNow.getHours()>=23 || timeNow.getHours()<10){
		dayPart="uneaeg";
	}
	//reede
	if (timeNow.getDay()==5){
		day="argipäev";
	}
	
	if (timeNow.getDay()==5 && timeNow.getHours()>=10 && timeNow.getHours()<12){
		dayPart="kooliaeg";
	}
	if (timeNow.getDay()==5 && (timeNow.getHours()>=12 && timeNow.getHours()<23)||(timeNow.getHours()>=8 && timeNow.getHours()<10)){
		dayPart="kooliväline aeg";
	}
	if (timeNow.getDay()==5 && timeNow.getHours()>=23 || timeNow.getHours()<8){
		dayPart="uneaeg";
	}
	//laup ja pühap
	if (timeNow.getDay()==0 || timeNow.getDay()==6){
		day="nädalavahetus";
	}


	return dayPart;
}
		

module.exports={monthsEt:monthNamesEt,daysEt:dayNamesEt,dateEt:dateEt,time:timeEE,weekday:weekDay,partOfDay:partOfDay};
