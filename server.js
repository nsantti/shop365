/*MongoDB Setup*/
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var ObjectID = mongodb.ObjectID;
var client = new MongoClient("mongodb://localhost:27017", { useNewUrlParser: true });
var db;

var express = require("express");

var app = express();

var http = require("http");

var server = http.Server(app);

var socketio = require("socket.io");

var io = socketio(server);

app.use(express.static("pub"));

io.sockets.on("connection", function (socket) {
	console.log("Somebody connected...");

	console.log(io.sockets.adapter.rooms);
	console.log("");

	function sendGroupListToClient() {
		db.listCollections().toArray(function (err, cols) {
			if (err != null) {
				console.log("ERROR: " + err);
			}
			else {
				cols.sort(compareGroups);
				io.emit("updateGroupList", cols);
			}
		});
	}

	function sendItemListToClient() {
		db.collection(socket.room).find({}).toArray(function(err, docs) {
			if (err!=null) {
				console.log("ERROR: " + err);
			}
			else {
				io.in(socket.room).emit("updateItemList", docs);
			}
		});
	}

	socket.on("getGroupCollections", function () {
		db.listCollections().toArray(function (err, cols) {
			if (err != null) {
				console.log("ERROR: " + err);
			}
			else {
				cols.sort(compareGroups);
				io.emit("updateGroupList", cols);
			}
		});
	});

	socket.on("addNewGroup", function (newGroupFromClient) {
		db.createCollection(newGroupFromClient, sendGroupListToClient);
	});

	socket.on("getGroupItems", function (group) {
		db.collection(group).find({}).toArray(function (err, docs) {
			if (err != null) {
				console.log("ERROR: " + err);
			}
			else {
				io.in(socket.room).emit("updateItemList", docs);
			}
		});
	});

	socket.on("togglePriority", function (group, id, priority) {
		db.collection(group).updateOne({ _id: ObjectID(id) }, { $set: { priority: oppositeBool(priority) } }, sendItemListToClient);
	});

	socket.on("togglePurchased", function (group, id, purchased) {
		db.collection(group).updateOne({ _id: ObjectID(id) }, { $set: { purchased: oppositeBool(purchased) } }, sendItemListToClient);
	});

	socket.on("receiveItemFromClient", function (group, name, quantity, comments, priority) {
		let objToInsert = {
			name: name,
			priority: priority,
			groupid: group,
			date: new Date(),
			quantity: quantity,
			purchased: false,
			comments: comments
		}
		db.collection(group).insertOne(objToInsert, sendItemListToClient);
	});

	socket.on("editItem", function (group, id, name, quantity, comments, priority) {
		db.collection(group).updateOne({ _id: ObjectID(id) }, {
			$set: {
				name: name,
				quantity: quantity,
				comments: comments,
				priority: priority
			}
		}, sendItemListToClient);
	});

	socket.on("removePurchased", function (group) {
		db.collection(group).deleteMany({ purchased: true }, sendItemListToClient);
	});

	socket.on("deleteGroup", function (group) {
		io.in(socket.room).emit("forceOutOfList");
		db.collection(group).drop(sendGroupListToClient);
	});


	socket.on("deleteItem", function (group, id) {
		db.collection(group).removeOne({ _id: ObjectID(id) }, sendItemListToClient);
	});

	socket.on("disconnect", function () {
		console.log("Somebody disconnected.");
	});

	socket.on("leaveRoom", function() {
		socket.leave(socket.room);
		console.log(io.sockets.adapter.rooms);
		console.log("");
	})

	socket.on("changeRoom", function (newRoom) {
		socket.leave(socket.room);
		socket.room = newRoom;
		socket.join(socket.room);
		console.log(io.sockets.adapter.rooms);
		console.log("");
		sendItemListToClient(socket.room);
	});

});

function compareGroups(a, b) {
	if (a.name < b.name)
		return -1;
	if (a.name > b.name)
		return 1;
	return 0;
}

function oppositeBool(bool) {
	return !bool;
}

client.connect(function (err) {
	if (err != null) throw err;
	else {
		db = client.db("shop365");

		server.listen(80, function () {
			console.log("Server with socket.io is ready.");
		});
	}
});