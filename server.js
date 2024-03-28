const express = require("express")
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');
//the above line exactly equal to 
//const childprcs = require("child_process")
//cont exec = childprcs.exec     

const app = express();

// Set the 'views' directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());



app.get("/home", (req,resp)=>{

	resp.render("form")
})


app.get("/collectdata", (req,resp)=>{
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
	const wsusername= req.query.wsusername;
	const wspassword= req.query.wspassword;
	console.log("workspace ips are ",websrvip, wsusername, wspassword);
	exec( `sed -i '6i\\${websrvip}  ansible_user=${wsusername}   ansible_password=${wspassword}' /etc/ansible/hosts` , ( error, stdout, stderr ) => {
		console.log("web server slaves are added "); 
		exec("ansible-playbook  ./scripts/HTTPDconfig.yml", ( playerror, wsplayout, wsplaystderror ) => {
			resp.send(wsplayout);

		})


	} )

})

app.post("/terraform",(req,resp)=>{
    const { cloudProvider,workspace, variables } = req.body;
    let terraformCommand = `terraform apply `;
	// REFERENCE COMMAND    terraform apply -var="region=us-west-2" -var="instance_type=t2.micro"
/*
    variables.forEach((variable, index) => {
        terraformCommand += ` -var="${variable}"`;
    });

	if ( cloudProvider === "aws"){
		if(workspace === "dev"){//change the work space to that by " terraform.exe workspace select dev "}
			//similarly for the deploy
			//also for the test stage also
	}
	else if(cloudProvider === "azure"){}
*/
    console.log('Received form data:', variables);

    resp.send('Form data received successfully!');
})


app.listen(2323, ()=>{

console.log("server started on 2323 ");
})
