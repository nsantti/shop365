
/*MongoDB Setup*/
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
var client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true });
var db;

var groupArray = [];

var clientGroup;

var express = require("express");

var app = express();

var http = require("http");

var server = http.Server(app);

var socketio = require("socket.io");

var io = socketio(server);

app.use(express.static("pub"));

function sendItemListToClient(err, res) {
	db.collection(clientGroup).find({}).toArray(function(err, docs) {
		if(err != null) {
			console.log("ERROR: " + err);
		}
		else {
			//console.log("Sending the requested group's item list to the client - sendItemListToClient");
			//io.sockets.in(clientGroup).emit('updateItemList', docs);
			io.emit("updateItemList", docs);
			//clientGroup = "";
		}
	});
}


/*function sendItemListToClient(err, res) {
	console.log("Sending item list to client");
	db.collection("items").find({name: { $ne: "group_entry" }}).toArray(function(err, docs) {
		if (err!=null) {
			console.log("ERROR: " + err);
		}
		else {
			io.emit("updateItemList", docs);
		}
	});
}*/

function sendGroupListToClient(err, res) {
	db.listCollections().toArray(function(err, cols) {
		if(err != null) {
			console.log("ERROR: " + err);
		}
		else {
			//groupArray = cols;
			socket.emit("updateGroupList", cols);
		}
	});
}

/*function sendGroupListToClient(err, res) {
	console.log("sending group list to client");
	db.collection("items").find({name: "group_entry"}, {projection: { _id: 0, groupid: 1}}).toArray(function(err, docs) {
		if(err != null) {
			console.log("ERROR: " + err);
		}
		else {
			groupArray = docs;
			console.log(groupArray);
			//console.log("Sending all groups to client");
			io.emit("updateGroupList", docs);
		}
	});
}*/

io.sockets.on("connection", function(socket) {
	console.log("Somebody connected...");

	/*Creating a room based on thr group selected*/
	socket.on('create', function(room) {
		//console.log("Group created!");
		console.log("Here is the room situation");
		socket.leaveAll();
		socket.join(room);
    	console.log(io.sockets.adapter.rooms);
		//console.log(socket.rooms);
	});

	//console.log(socket.rooms);

	socket.on("getGroupCollections", function() {
		db.listCollections().toArray(function(err, cols) {
			if(err != null) {
				console.log("ERROR: " + err);
			}
			else {
				//groupArray = cols;
				io.emit("updateGroupList", cols);
			}
		});
	});

/*	socket.on("getGroups", function() {
		db.collection("items").find({name: "group_entry"}, {projection: { _id: 0, groupid: 1}}).toArray(function(err, docs) {
			if(err != null) {
				console.log("ERROR: " + err);
			}
			else {
				groupArray = docs;
				console.log(groupArray);
				socket.emit("updateGroupList", docs);
			}
		});
	});*/

	socket.on("addNewGroup", function(newGroupFromClient) {
		clientGroup = newGroupFromClient
		db.createCollection(newGroupFromClient, sendGroupListToClient);
	});

/*	socket.on("createGroupEntry", function(newGroupFromClient) {
		clientGroup = newGroupFromClient;
		let objToInsert = {
			name: "group_entry",
			priority: false,
			groupid: newGroupFromClient,
			date: Date(),
			quantity: 0,
			purchased: false,
			comments: "Group entry for memory"
		}
		db.collection("items").insertOne(objToInsert, sendItemListToClient);
	});*/

	socket.on("getGroupItems", function(group) {
		db.collection(group).find({}).toArray(function(err, docs) {
			if (err!=null) {
				console.log("ERROR: " + err);
			}
			else {
				//console.log("Sending the requested group's item list to the client - getGroupItems");
				io.sockets.in(group).emit('updateItemList', docs);
				//socket.emit("updateItemList", docs);
			}
		});
	});

/*	socket.on("getGroupItems", function(group) {									//"Request Refresh Call"
		db.collection("items").find({name: { $ne: "group_entry" }, groupid: group}).toArray(function(err, docs) {
			if (err!=null) {
				console.log("ERROR: " + err);
			}
			else {
				console.log("Sending the group list to client");
				socket.emit("updateItemList", docs);
			}
		});
	});*/


/*	socket.on("getAllItems", function() {											//"Request Refresh Call"
		db.collection("items").find({}).toArray(function(err, docs) {
			if (err!=null) {
				console.log("ERROR: " + err);
			}
			else {
				socket.emit("updateItemList", docs);
			}
		});
	});*/

	socket.on("togglePriority", function(group, id, priority) {
		clientGroup = group;
		console.log(oppositeBool(priority));
		db.collection(group).updateOne({_id: ObjectID(id)}, { $set: { priority: oppositeBool(priority)}}, sendItemListToClient);
	});

	socket.on("togglePurchased", function(group, id, purchased) {
		clientGroup = group;
		console.log("Toggling the purchased field of " + id + "and purchased should become "+ oppositeBool(purchased));
		db.collection(group).updateOne({_id: ObjectID(id)}, { $set: { purchased: oppositeBool(purchased) }}, sendItemListToClient);
	});

	socket.on("receiveItemFromClient", function(group, name, quantity, comments, priority) {
		let objToInsert = {
			name: name,
			priority: priority,
			groupid: group,
			date: Date(),
			quantity: quantity,
			purchased: false,
			comments: comments
		}
		clientGroup = group;
		db.collection(group).insertOne(objToInsert, sendItemListToClient);
		//insertNewItem("items", objToInsert);
		console.log("item inserted");
		//db.close();
	});

	socket.on("editItem", function(group, id, name, quantity, comments, priority) {
		clientGroup = group;
		console.log(id + " "+name+" "+quantity+" "+comments+" "+priority);
		db.collection(group).updateOne({_id: ObjectID(id)}, {$set: {
			name: name,
			quantity: quantity,
			comments: comments,
			priority: priority
		}}, 
			sendItemListToClient);
		console.log("Item updated");
	});

	socket.on("deleteItem", function(group, id) {
		clientGroup = group;
		db.collection(group).removeOne({_id: ObjectID(id)}, sendItemListToClient);
	});

	socket.on("removePurchased", function(group) {
		clientGroup = group;
		console.log(group);	
		db.collection(group).deleteMany({purchased: true}, sendItemListToClient);
	});

	socket.on("deleteGroup", function(group) {
		clientGroup = group;
		db.collection(group).drop(sendGroupListToClient);
	});

/*	socket.on("deleteGroup", function(group) {
		db.collection("items").remove({groupid: group}, sendGroupListToClient);
	});*/

	socket.on("disconnect", function() {
		console.log("Somebody disconnected.");
	});
	
});


/*var nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){
  console.log('someone connected');
});*/


function findAll(collection, group) {
	db.collection(collection).find({groupid: group}).toArray(function(err, result) {
		if(err) throw err;
		console.log(result);
		//client.close();
	});
}

function insertNewItem(collection, objToInsert) {
	db.collection(collection).insertOne(objToInsert, function(err,res) {
		if (err) throw err;
		//console.log("1 item inserted");
		//client.close();
	})
}

function oppositeBool(bool) {
	if(bool == true)
		return false;
	else
		return true;
}


client.connect(function(err) {
	if (err != null) throw err;
	else {
		db = client.db("shop365");

		server.listen(80, function() {
			console.log("Server with socket.io is ready.");
		});
	}
});

