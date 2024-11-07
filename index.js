const express = require("express");
const dtEt = require("./dateTimeEt");
const fs = require("fs");
const dbInfo = require("../../vp2024config");
const mysql = require("mysql2");
//päringu lahtiharutamiseks POST päringute puhul
const bodyparser = require("body-parser");
let printTime = dtEt.time();
let printDate = dtEt.dateEt();
const multer = require("multer");
const sharp = require("sharp"); 
//parooli krüpteerimiseks
const bcrypt = require("bcrypt");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
//päringu URL-i parsimine, false kui ainult tekst, true, kui muud ka
app.use(bodyparser.urlencoded({extended: true}));
//seadistame vahevara multer fotode laadimiseks kindlasse kataloogi
const upload = multer({dest: "./public/gallery/orig/"});

const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: "if24_lisette_re"
});



app.get("/", (req, res)=>{
	//res.send("Express läks täiesti käima!");
});

app.get("/signin", (req.res)=>{
	res.render("signin", {notice: notice})
});

app.post("/signin", (req, res)=>{
	let notice = "";
	if (!req.body.emailInput || !req.body.passwordInput){
		console.log("Andmeid puudu");
		notice = "Sisselogimise andmeid on puudu!";
		res.render("index", {notice: notice})
	}
	else{
		let sqlReq = "SELECT id, password FROM users WHERE email = ?";
		conn.execute(sqlReq, [req.body.emailInput], (err, result)=>{
			if(err){
				console.log("Viga andmebaasist lugemisel" + err);
				notice = "Sisselogimine ebaõnnestus.";
				res.render("index", {notice: notice})
			}
			else{
				if(result[0] !=null){
					//kasutaja on olemas, kontollime sisestatud parooli
					bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{
						if(err){
							notice = "Sisselogimine ebaõnnestus.";
							res.render("index", {notice: notice})
						}
						else{
							//kas õige või vale parool
							if(compareresult){
								notice = "Oled sisse loginud.";
								res.render("index", {notice: notice})
							}
							else{
								notice = "Kasutajatunnus ja/või parool on vale.";
								res.render("index", {notice: notice})
							}
						}
					});
					
				}
				else{
					notice = "Kasutajatunnus ja/või parool on vale.";
					res.render("index", {notice: notice})
				}
				
			}
		}); //conn.execute lõppeb
	}
});

app.get("/signup", (req, res)=>{
	res.render("signup");
});

app.post("/signup", (req, res)=>{
	let notice = "Ootan andmeid.";
	console.log(req.body);
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput || !req.body.genderInput || !req.body.emailInput || req.body.passwordInput.length < 8 || req.body.passwordInputreq.body.passwordInput !== req.body.confirmPasswordInput){
		console.log("Andmeid on puudu, või paroolid ei kattu!");
		notice ="Andmeid on puudu, parool liiga lühike, või paroolid ei kattu.";
		res.render("signup", {notice: notice});
	}
	else{
		notice = "Andmed õigesti sisestatud.";
		//loome parooli räsi
		bcrypt.genSalt(10, (err, salt)=> {
			if(err){
				notice = "Tehniline viga, kasutajat ei loodud.";
				res.render("signup", {notice: notice});
			} 
			else {
				//krüptime
				bcrypt.hash(req.body.passwordInput, salt, pwdHash=>{
					if(err){
						notice = "Tehniline viga parooli krüpteerimisel, kasutajat ei loodud.";
						res.render("signup", {notice: notice});
					}
					else{
						let sqlReq = "INSERT INTO users (first_name, last_name, birth_date, gender, email, password) VALUES(?,?,?,?,?,?)";
						conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput, req.body.genderInput, req.body.emailInput, req.body.passwordInput], (err, result)=>{
							if(err){
								notice="Tehniline viga andmebaasi kirjutamisel, kasutajat ei loodud.";
								res.render("signup", {notice: notice});
							}
							else {
								notice = "Kasutaja " + req.body.emailInput + "edukalt loodud!";
								res.render("signup", {notice: notice});
							}
						}); //conn.execute lõpp
					}
				});//hash lõppeb
			}
		});//genSalt lõppeb
	}
	//res.render("signup");
});

app.get("/timenow", (req, res)=>{
	const weekdayNow = dtEt.weekday();
	const dateNow = dtEt.dateEt();
	const timeNow = dtEt.time();
	res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowT: timeNow});
});

app.get("/vanasonad", (req, res)=>{
	let folkWisdom = [];
	fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data)=>{
		if(err){
			//throw err;
			res.render("justlist", {h2: "Vanasõnad", listData: ["Ei leidnud ühtegi vanasõna!"]});
		}
		else {
			folkWisdom = data.split(";");
			res.render("justlist", {h2: "Vanasõnad", listData: folkWisdom});
		}
	});
});

app.get("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	console.log(req.body);
	fs.open("public/textfiles/visitlog.txt", "a", (err, file)=>{
		if(err){
			throw err;
		}
		else {
			fs.appendFile("public/textfiles/visitlog.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ";", (err)=>{
				if(err){
					throw err;
				}
				else {
					console.log("Faili kirjutati!");
					res.render("regvisit");
				}
			});
		}
	});
});

app.get("/visitlog", (req,res)=>{
	let visitors=[];
	fs.readFile("public/textFiles/visitlog.txt", "utf8", (err, data)=>{
		if(err){
			//throw err;
			res.render("justList",{h2:"Külastajad",listData:["Ei leidnud ühtegi külastajat!"]});

		}
		else{
			visitors=data.split(";");
			res.render("justList",{h2:"Külastajad",listData:visitors});
		}
	});
});

app.get("/regVisitDB",(req, res)=>{
	let notice="";
	let firstName="";
	let lastName="";
	res.render("regVisitDB", {notice: notice, firstName: firstName, lastName: lastName});
});

app.post("/regVisitDB",(req, res)=>{
	let notice="";
	let firstName="";
	let lastName="";
	if(!req.body.firstNameInput || !req.body.lastNameInput){
		firstName=req.body.firstNameInput;
		lastName=req.body.lastNameInput;
		notice="Osa andmeid sisestamata!";
		res.render("regVisitDB", {notice: notice, firstName: firstName, lastName: lastName});
	}
	else{
		let sqlreq="INSERT INTO vp1visitlog (first_name, last_name) VALUES(?,?)";
		conn.query(sqlreq, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlres)=>{
			if(err){
						throw err
					}
					else{
						notice="Külastus registreeritud!";
						res.render("regVisitDB", {notice: notice, firstName: firstName, lastName: lastName});
					}
		});
	}
});

app.get("/visitlogDB",(req, res)=>{
	let sqlrreq = "SELECT first_name, last_name, visit_time FROM vp1visitlog";
	let visitor=[];
	conn.query(sqlrreq, (err, sqlres)=>{
		if (err){
			throw err;
		}
		else{
			console.log(sqlres);
			visitor=sqlres;
			res.render("visitlogDB", {visitor: visitor});
		}
	});
	//res.render("tegelased");
});

app.get("/eestifilm",(req, res)=>{
	res.render("filmindex.ejs");
});

app.get("/eestifilm/tegelased", (req, res)=>{
	let sqlReq ="SELECT first_name, last_name, birth_date FROM person"
	let persons =[];
	connInga.query(sqlReq, (err,sqlres)=>{
		//persons = sqlres;
		//for i algab 0 piiriks slres.length
		//tsükli sees lisame persons listile uue elemendi, mis on ise "objekt" {first_name: sqlres[i].first_name} 
		//listi lisamiseks on käsk
		//push.persons(lisatav element);
		
		if (err){
			throw err;
		}
		else {
			console.log(sqlres);
			for(let i=0; i < sqlres.length; i++){
			let newObject=({first_name: sqlres[1].first_name, last_name:sqlres[1].last_name, birth_date: dtEt.givenDateFormatted(sqlres[i].birth_date)});
			};
		res.render("tegelased", {person, persons});
		}
	});
});

app.get("/movieSubmit",(req, res)=>{
	let notice="";
	let movieTitle="";
	let movieYear="";
	let movieDuration="";
	let movieDescription="";
	res.render("movieSubmit", {notice: notice, movieTitle: movieTitle, movieYear: movieYear, movieDuration:movieDuration, movieDescription:movieDescription});
});

app.post("/movieSubmit",(req, res)=>{
	let notice="";
	let movieTitle="";
	let movieYear="";
	let movieDuration="";
	let movieDescription="";
	if(!req.body.movieTitleInput || !req.body.movieYearInput || !req.body.movieDurationInput || !req.body.movieDescriptionInput){
		movieTitle=req.body.movieTitleInput;
		movieYear=req.body.movieYearInput;
		movieDuration=req.body.movieDurationInput;
		movieDescription=req.body.movieDescriptionInput;
		notice="Osa andmeid sisestamata!";
		res.render("movieSubmit", {notice: notice, movieTitle: movieTitle, movieYear: movieYear, movieDuration:movieDuration, movieDescription:movieDescription});
	}
	else{
		let sqlreq="INSERT INTO movie (title, production_year, duration, description) VALUES(?,?,?,?)";
		conn.query(sqlreq, [req.body.movieTitleInput, req.body.movieYearInput, req.body.movieDurationInput, req.body.movieDescriptionInput], (err, sqlres)=>{
			if(err){
						throw err
					}
					else{
						notice="Film lisatud!";
						res.render("movieSubmit", {notice: notice, movieTitle: movieTitle, movieYear: movieYear, movieDuration:movieDuration, movieDescription:movieDescription});
					}
		});
	}
});

app.get("/personSubmit",(req, res)=>{
	let notice="";
	let firstName="";
	let lastName="";
	let birthDate="";
	res.render("personSubmit", {notice:notice, firstName:firstName, lastName:lastName, birthDate:birthDate});
});

app.post("/personSubmit",(req, res)=>{
	let notice="";
	let firstName="";
	let lastName="";
	let birthDate="";
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput){
		firstName=req.body.firstNameInput;
		lastName=req.body.lastNameInput;
		birthDate=req.body.birthDateInput;
		notice="Osa andmeid sisestamata!";
		res.render("personSubmit", {notice: notice, firstName: firstName, lastName: lastName, birthDate:birthDate});
	}
	else{
		let sqlreq="INSERT INTO person (first_name, last_name, birth_date) VALUES(?,?,?)";
		conn.query(sqlreq, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput], (err, sqlres)=>{
			if(err){
						throw err
					}
					else{
						notice="Isik lisatud!";
						res.render("personSubmit", {notice: notice, firstName: firstName, lastName: lastName, birthDate:birthDate});
					}
		});
	}
});

app.get("/roleSubmit",(req, res)=>{
	let notice="";
	let positionName="";
	let positionDescription="";
	res.render("roleSubmit", {notice:notice, positionName:positionName, positionDescription:positionDescription});
});

app.post("/roleSubmit",(req, res)=>{
	let notice="";
	let positionName="";
	let positionDescription="";
	if(!req.body.positionNameInput || !req.body.positionDescriptionInput){
		positionName=req.body.positionNameInput;
		positionDescription=req.body.positionDescriptionInput;
		notice="Osa andmeid sisestamata!";
		res.render("roleSubmit", {notice:notice, positionName:positionName, positionDescription:positionDescription});
	}
	else{
		let sqlreq="INSERT INTO position (position_name, description) VALUES(?,?)";
		conn.query(sqlreq, [req.body.positionNameInput, req.body.positionDescriptionInput], (err, sqlres)=>{
			if(err){
						throw err
					}
					else{
						notice="Roll lisatud!";
						res.render("roleSubmit", {notice:notice, positionName:positionName, positionDescription:positionDescription});
					}
		});
	}
});
app.get("/addnews", (req, res)=>{
	res.render("addnews");
});

app.post("/addNews",(req, res)=>{
	let notice="";
	let newsTitle="";
	let newsText="";
	let newsDate="";
	let expDate="";
	let userID="";
	if(req.body.newsTitleInput.length<=3 || req.body.newsTextInput<=10 || !req.body.newsDateInput){
		newsTitle=req.body.newsTitleInput;
		newsText=req.body.newsTextInput;
		newsDate=dtEt.dateEt();
		expDate=newsDate+10;
		userID="1";
		notice="Osa andmeid sisestamata!";
		res.render("addNews", {notice: notice, newsTitle: newsTitle, newsText: newsText, newsDate:newsDate, expDate:expDate, userID:userID});
	}
	else{
		let sqlreq="INSERT INTO vp1news (news_title, news_text, news_date, expire_date) VALUES(?,?,?,?)";
		conn.query(sqlreq, [req.body.newsTitleInput, req.body.newsTextInput, req.body.newsDateInput, expDate], (err, sqlres)=>{
			if(err){
						throw err
					}
					else{
						notice="Uudis lisatud!";
						res.render("addNews", {notice: notice, newsTitle: newsTitle, newsText: newsText, newsDate:newsDate, expDate:expDate});
					}
		});
	}
});

app.get("/photoupload", (req, res)=>{
	res.render("photoupload");
});

app.post("/photoupload", upload.single("photoInput"), (req, res)=>{
	console.log(req.body); 
	console.log(req.file);
	//genereerime oma failinime
	const fileName = "vp_" + Date.now() + ".jpg";
	//nimetame üleslaetud faili ümber
	fs.rename(req.file.path, req.file.destination + fileName, (err)=>{
		console.log(err);
	});
	//teeme 2 erisuurust
	sharp(req.file.destination + fileName).resize(800,600).jpeg({quality: 90}).toFile("./public/gallery/normal/" + fileName);
	sharp(req.file.destination + fileName).resize(100,100).jpeg({quality: 90}).toFile("./public/gallery/thumb/" + fileName);
	//salvestame andmebaasi
	let sqlReq ="INSERT INTO photos(file_name, orig_name, alt_text, privacy, user_id) VALUES(?,?,?,?,?)";
	const userId =1;
	conn.query(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId], (err, result)=>{
		if(err){
			throw err;
		}
		else{
			res.render("photoupload");
		}
	});
});


app.listen(5179);