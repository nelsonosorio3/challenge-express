var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
    clients: {},
    reset: ()=>{
        model.clients = {};
    },
    addAppointment: (client, appointment)=>{
        appointment.status = "pending";
        if(!model.clients.hasOwnProperty(client)){
            model.clients[client] = [appointment];
        }
        else{
            model.clients[client].push(appointment);
        }
        
    },
    attend: (name, date) =>{
        model.clients[name].forEach(appointment => {
            if(appointment.date === date){
                appointment.status = "attended";
            }
        })
    },
    expire: (name, date) =>{
        model.clients[name].forEach(appointment =>{
            if(appointment.date === date){
                appointment.status = "expired";
            }
        })
    },
    cancel: (name, date) =>{
        model.clients[name].forEach(appointment => {
            if(appointment.date === date){
                appointment.status = "cancelled";
            }
        })
    },
    erase: (name, secondParameter) =>{
        const statuses = ["pending", "attended", "expired", "cancelled"];
        let deletedArrays = [];
        if(statuses.includes(secondParameter)){
            for (let i = 0; i < model.clients[name].length; i++) {
                if(model.clients[name][i].status === secondParameter){
                    deletedArrays.push(model.clients[name][i])
                    model.clients[name].splice(i, 1);
                    i--;
                }
            }
        }
        else{
            for (let i = 0; i < model.clients[name].length; i++) {
                if(model.clients[name][i].date === secondParameter){
                    deletedArrays.push(model.clients[name][i])
                    model.clients[name].splice(i, 1);
                    i--;
                }
                
            }
        }
        return deletedArrays;
    },
    getAppointments: (client, status) =>{
        let appointments = [];
        if(status){
            appointments = model.clients[client].filter(appointment => appointment.status === status);
        }
        else{
            appointments = model.clients[client].map(appointments => appointments);
        }
        return appointments;
        
    },
    getClients: () =>{
        return Object.keys(model.clients);
    },
};

server.use(bodyParser.json());

server.get("/api", (req, res)=>{
    res.send(model.clients);
});

server.post("/api/Appointments", (req, res) =>{
    const {client, appointment} = req.body;
    if(!client){
        return res.status(400).send("the body must have a client property");
    }
    else if(typeof client !== "string"){
        return res.status(400).send("client must be a string");
    }
    model.addAppointment(client, appointment);
    return res.send(appointment);
});

server.get("/api/Appointments/:name", (req, res) =>{
    const {name} = req.params;
    const {date, option} = req.query;
    const hasAppointment = model.clients[name]?.find(appointment => appointment.date === date)
    const optionArray = ["attend", "expire", "cancel"];
    if(name === "clients"){
        return res.send(model.getClients());
    }
    else if(!model.clients.hasOwnProperty(name)){
        return res.status(400).send("the client does not exist");
    }
    else if(!hasAppointment){
        return res.status(400).send("the client does not have a appointment for that date");
    }
    else if(!optionArray.includes(option)){
        return res.status(400).send("the option must be attend, expire or cancel");
    }

    if(option === "attend") model.attend(name, date);
    if(option === "expire") model.expire(name, date);
    if(option === "cancel") model.cancel(name, date);

    let modifiedAppointment = model.clients[name].filter(appointment => appointment.date === date);
    res.send(modifiedAppointment[0])
});

server.get("/api/Appointments/:name/erase", (req, res) =>{
    const {name} = req.params;
    if(!model.clients.hasOwnProperty(name)){
        return res.status(400).send("the client does not exist");
    }
    
    res.send(model.erase(name, req.query.date))
});

server.get("/api/Appointments/getAppointments/:name", (req, res) =>{
    res.send(model.getAppointments(req.params.name, req.query.status))
});

// server.get("/api/Appointments/clients", (req, res) =>{
//     res.send(model.getClients())
// });

server.listen(3000);
module.exports = { model, server };
