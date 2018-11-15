
/*MongoDB Setup*/
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
var client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true });
var db;

var groups = [];

var express = require("express");

var app = express();

var http = require("http");

var server = http.Server(app);

var socketio = require("socket.io");

var io = socketio(server);

app.use(express.static("pub"));

function sendItemListToClient(err, res) {
	db.collection("items").find({}).toArray(function(err, docs) {
		if (err!=null) {
			console.log("ERROR: " + err);
		}
		else {
			io.emit("updateItemList", docs);
		}
	});
}

io.on("connection", function(socket) {
	console.log("Somebody connected...");

	socket.on("getGroupItems", function() {											//"Request Refresh Call"
		db.collection("items").find({}).toArray(function(err, docs) {
			if (err!=null) {
				console.log("ERROR: " + err);
			}
			else {
				socket.emit("updateItemList", docs);
			}
		});
	});

	socket.on("togglePriority", function(id, priority) {
		console.log(oppositeBool(priority));
		var query = {_id: new ObjectID(id)};
		var newPriority = { $set: { priority: oppositeBool(priority)}};
		db.collection("items").updateOne(query, newPriority, sendItemListToClient);
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
		db.collection("items").insertOne(objToInsert, sendItemListToClient);
		//insertNewItem("items", objToInsert);
		console.log("item inserted");
		//db.close();
	});

	socket.on("disconnect", function() {
		console.log("Somebody disconnected.");
	});
	
	/*socket.on("receiveItemFromClient", function(name, quantity, comment, priority) {
		io.emit("displayItemFromServer", name, quantity, comment, priority);
	});*/
});


function findAll(collection) {
	db.collection(collection).find({}).toArray(function(err, result) {
		if(err) throw err;
		//console.log(result);
		client.close();
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

