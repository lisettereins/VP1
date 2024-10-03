const express = require("express");
const app = express();
const dtEt = require(./dateTime.js
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/",(req,res)=>(
	res.render("index.ejs");
));

app.get("/timenow, (req,res)=>(
	const weekdayNow = dtEt.weekDay();
	const dateNow = dtEt.timeFormatted();
	const timeNow = dtEt.timeFormatted();
	res.render("timenow",{nowWD: weekdayNow,nowD: dateNow, nowT: timeNow});
));

app.listen(5100);
