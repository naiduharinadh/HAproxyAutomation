const express = require("express")
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');
const re = require('re');
//the above line exactly equal to 
//const childprcs = require("child_process")
//cont exec = childprcs.exec     


const ip = "3.27.214.175" ;
const app = express();

// Set the 'views' directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());


//updated line from harinadh
app.get("/home", (req,resp)=>{
	const data = {
            ip: ip,
        };

	resp.render("form",data)
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
    const { cloudProvider,workenv, variables } = req.body;
    let terraformCommand = `terraform apply `;
	// REFERENCE COMMAND    terraform apply -var="region=us-west-2" -var="instance_type=t2.micro"

	// terraform plan --dir=./terraform

    variables.forEach((variable, index) => {
        terraformCommand += `  --${variable.value}`;
    });

	const command = `bash ./change_workspace.sh ${workenv}`;

	if ( cloudProvider === "aws"){
		//command 1 to change the workdir  
//		exec("bash ./scripts/change_workspace.sh" , (err,stdout, stderr)=>{
		console.log("if block");
		exec( command , (err,stdout, stderr)=>{
			if(err){
				resp.send(err);
			}
			else if(stderr){
				resp.send(stderr);
			}
			else{
				console.log(stdout.resource);
//				resp.send("<pre>"+stdout+"</pre>");

				exec("cd ./terraform " , (err,stdout, stderr)=>{
					console.log("this is else block inside aws ");
					
					if(err){
						resp.send(err);
					}
					else if (stderr){
						resp.send(stderr)
					}
					else{
						exec("terraform apply ",(err, stdout, stderr)=>{
							if (err){
								console.log(err)
							}
							else{
								resp.write (stdout);
							}
						})
					}
				})
			}
		 })
	

		// command to execute the terraform 
/*		exec("terraform plan --dir=./terraform " ,(err,stdout, error)=>{
			if(err){
				resp.send(err);
			}
			else if(stderr){
				resp.send(stderr);
			}
			else{
				resp.send(stdout);
			}

		})*/
		

	}
	else if(cloudProvider === "azure"){}


    console.log('Received form data:', cloudProvider,workenv,variables );
    console.log(terraformCommand)

//    resp.send('Form data received successfully!');
})


app.listen(2323, ()=>{

console.log("server started on portnumber  2323 ");
})
