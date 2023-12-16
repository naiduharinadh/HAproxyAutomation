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
	exec(`sed -i '3i\\${lbip} ansible_user=${username} ansible_password=${password} ' /etc/ansible/hosts`,(error,stdoutput,stderr)=>{
		console.log("this is upper block ");
		exec("ansible-playbook  ./scripts/haProxy.yml", (anserror,ansibleOut, ansibleStderr )=> {


		console.log("this is harinadh..... sub child ");
		resp.send(ansibleOut);

		})
//		resp.send(ansibleOut); 

	})


//resp.send("data collected");


})



app.get("/createws",(req,resp)=>{

	const websrvip = req.query.websrvip;
	const wsusername= req.query.username;
	const wspassword= req.query.wspassword;
	exec( `sed -i'5i\\${websrvip}  ansible_user=${wsusername}   ansible_password=${wspassword}' /etc/ansible/hosts` , ( error, stdout, stderr ) => {
		console.log("web server slaves are added "); 
		exec("ansible-playbook  ./scripts/HTTPset.yml", ( playerror, wsplayout, wsplaystderror )=>{
			resp.send(wsplayout);

		})


	} )

})




app.listen(2323, ()=>{

console.log("server started on 2323 ");
})
