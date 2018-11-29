
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

io.sockets.on("connection", function(socket) {
	console.log("Somebody connected...");

	socket.room = 'test_group';
	socket.join('test_group');

	/*CALLBACK FUNCTIONS*/
	function sendGroupListToClient() {
		db.listCollections().toArray(function(err, cols) {
			if(err != null) {
				console.log("ERROR: " + err);
			}
			else {
				//groupArray = cols;
				cols.sort(compareGroups);
				io.emit("updateGroupList", cols);
			}
		});
	}

	function sendItemListToClient() {
		db.collection(clientGroup).find({}).toArray(function(err, docs) {
			if(err != null) {
				console.log("ERROR: " + err);
			}
			else {
				io.in(socket.room).emit("updateItemList", docs);
			}
		});
	}



	socket.on("getGroupCollections", function() {
		db.listCollections().toArray(function(err, cols) {
			if(err != null) {
				console.log("ERROR: " + err);
			}
			else {
				//groupArray = cols;
				cols.sort(compareGroups);
				io.emit("updateGroupList", cols);
			}
		});
	});

	socket.on("addNewGroup", function(newGroupFromClient) {
		clientGroup = newGroupFromClient
		db.createCollection(newGroupFromClient, sendGroupListToClient);
	});

	socket.on("getGroupItems", function(group) {
		db.collection(group).find({}).toArray(function(err, docs) {
			if (err!=null) {
				console.log("ERROR: " + err);
			}
			else {
				io.in(socket.room).emit("updateItemList", docs);
			}
		});
	});

	socket.on("togglePriority", function(group, id, priority) {
		db.collection(group).updateOne({_id: ObjectID(id)}, { $set: { priority: oppositeBool(priority)}}, sendItemListToClient);
		/*db.collection(group).updateOne({_id: ObjectID(id)}, { $set: { priority: oppositeBool(priority)}}, function() {
			io.in(socket.room).emit("forceClientCall", true);
		});*/
	});

	socket.on("togglePurchased", function(group, id, purchased) {
		db.collection(group).updateOne({_id: ObjectID(id)}, { $set: { purchased: oppositeBool(purchased) }}, sendItemListToClient);
		/*db.collection(group).updateOne({_id: ObjectID(id)}, { $set: { purchased: oppositeBool(purchased) }}, function() {
			io.in(socket.room).emit("forceClientCall", true);
		});*/
	});

	socket.on("receiveItemFromClient", function(group, name, quantity, comments, priority) {
		let objToInsert = {
			name: name,
			priority: priority,
			groupid: group,
			date: new Date(),
			quantity: quantity,
			purchased: false,
			comments: comments
		}
		clientGroup = group;
		db.collection(group).insertOne(objToInsert, sendItemListToClient);
		/*db.collection(group).insertOne(objToInsert, function() {
			io.in(socket.room).emit("forceClientCall");
		});*/
	});

	socket.on("editItem", function(group, id, name, quantity, comments, priority) {
		db.collection(group).updateOne({_id: ObjectID(id)}, {$set: {
			name: name,
			quantity: quantity,
			comments: comments,
			priority: priority
		}}, 
		sendItemListToClient);
		/*function() {
			io.in(socket.room).emit("forceClientCall");
		});*/
		console.log("Item updated");
	});

	socket.on("removePurchased", function(group) {
		/*db.collection(group).deleteMany({purchased: true}, function() {
			io.in(socket.room).emit("forceClientCall");
		});*/
		clientGroup = group;
		db.collection(group).deleteMany({purchased: true}, sendItemListToClient);
	});

	socket.on("deleteGroup", function(group) {
		clientGroup = group;
		io.in(socket.room).emit("forceOutOfList");
		db.collection(group).drop(sendGroupListToClient);
	});


	socket.on("deleteItem", function(group, id) {
		clientGroup = group;
		db.collection(group).removeOne({_id: ObjectID(id)}, sendItemListToClient);
		/*db.collection(group).removeOne({_id: ObjectID(id)}, function() {
			io.in(socket.room).emit("forceClientCall");
		});*/
	});

	socket.on("disconnect", function() {
		console.log("Somebody disconnected.");
	});

	socket.on("changeRoom", function(newRoom) {
		clientGroup = newRoom;
		socket.leave(socket.room);
		socket.room = newRoom;
		socket.join(socket.room);
		sendItemListToClient();
		//console.log(io.sockets.adapter.rooms);
		//socket.emit("forceClientCall");
		//console.log("Current room: " + socket.room);
	});
	
});

function compareGroups(a,b) {
	if (a.name < b.name)
	  return -1;
	if (a.name > b.name)
	  return 1;
	return 0;
}

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
	});
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
