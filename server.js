
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


/*function sendItemListToClient(err, res) {
	console.log("Sending item list to client");
	io.emit("forceClientCall", 'forcing');
	// db.collection("items").find({}).toArray(function(err, docs) {
	// 	if (err!=null) {
	// 		console.log("ERROR: " + err);
	// 	}
	// 	else {
	// 		io.emit("updateItemList", docs);
	// 	}
	// });
}*/

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

io.sockets.on("connection", function(socket) {
	console.log("Somebody connected...");


	socket.room = 'test_group';
	socket.join('test_group');



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

	/*socket.on("getGroups", function() {
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
		console.log("Fetching the items for " + group);
		db.collection(group).find({}).toArray(function(err, docs) {
			console.log(docs);
			if (err!=null) {
				console.log("ERROR: " + err);
			}
			else {
				io.in(socket.room).emit("updateItemList", docs);
			}
		});
	});

	socket.on("togglePriority", function(group, id, priority) {
		clientGroup = group;
		console.log(oppositeBool(priority));
		db.collection(group).updateOne({_id: ObjectID(id)}, { $set: { priority: oppositeBool(priority)}}, function() {
			io.in(socket.room).emit("forceClientCall");
		});
	});

	socket.on("togglePurchased", function(group, id, purchased) {
		console.log(group + " " + id + " " + purchased);
		clientGroup = group;
		console.log("Toggling the purchased field of " + id + "and purchased should become "+ oppositeBool(purchased));
		db.collection(group).updateOne({_id: ObjectID(id)}, { $set: { purchased: oppositeBool(purchased) }}, function() {
			io.in(socket.room).emit("forceClientCall");
		});
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
		db.collection(group).insertOne(objToInsert, function() {
			io.in(socket.room).emit("forceClientCall");
		});
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
		}}, function() {
			io.in(socket.room).emit("forceClientCall");
		});
		console.log("Item updated");
	});

	/*socket.on("deleteItem", function(group, id) {
		clientGroup = group;
		db.collection(group).removeOne({_id: ObjectID(id)}, sendItemListToClient);
	});*/

	socket.on("removePurchased", function(group) {
		clientGroup = group;
		console.log("Removing the purchased items for " + group);
		console.log(group);	
		//db.collection(group).deleteMany({purchased: true}, sendItemListToClient);
		db.collection(group).deleteMany({purchased: true}, function() {
			io.in(socket.room).emit("forceClientCall");
		});
	});

	socket.on("deleteGroup", function(group) {
		clientGroup = group;
		db.collection(group).drop(sendGroupListToClient);
		io.in(socket.room).emit("forceOutOfList");
	});


	socket.on("deleteItem", function(group, id) {
		clientGroup = group;
		db.collection(group).removeOne({_id: ObjectID(id)}, function() {
			io.in(socket.room).emit("forceClientCall");
		});
	});

	/*socket.on("deleteGroup", function(group) {
		db.collection("items").remove({groupid: group}, sendGroupListToClient);
	});*/

	socket.on("disconnect", function() {
		console.log("Somebody disconnected.");
	});

	socket.on("changeRoom", function(newRoom) {
		socket.leave(socket.room);
		socket.room = newRoom;
		socket.join(socket.room);
		console.log(io.sockets.adapter.rooms);
		socket.emit("forceClientCall", 'forcing a call to the update function');
		console.log("Current room: " + socket.room);
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
