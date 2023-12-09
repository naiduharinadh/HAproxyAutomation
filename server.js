const express = require("express")
const path = require('path');
const { exec } = require('child_process');
//the above line exactly equal to 
//const childprcs = require("child_process")
//cont exec = childprcs.exec     

const app = express();

// Set the 'views' directory
app.set('views', path.join(__dirname, 'views'));


app.set('view engine', 'ejs');


app.get("/home", (req,resp)=>{

resp.render("form")

})


app.get("/collectData", (req,resp)=>{


	const username = req.query.username;
	const lbip=req.query.lbip;
	const password= req.query.password;

	console.log(username,lbip,password);
	exec(`sed -i '3i\\${lbip} ansible_user=${username} ansible_password=${password} ' /etc/ansible/hosts`,(stdout,stderr,error)=>{
		if (stdout){
			exec("MakeLB.sh",(stdout,stderr,error)=>{
				resp.send("LoadBalancer created on the top of the"+lbip);

			})
		}

		else if(stderr){
			resp.send(stderr);
		}
		else if(error){
			resp.send(error);
		}

	})


//resp.send("data collected");


})

app.listen(2323, ()=>{

console.log("server started on 2323 ");
})
