
var socket = io();

var allGroups = [];

var group = "No Group Selected";

var clientItemArray = [];

var currentItem;

var purchasedCount;

socket.on("updateGroupList", function(groupArrayFromServer) {
    allGroups = groupArrayFromServer;
   // console.log(allGroups);
    //console.log(allGroups[0].groupid);
    $("#groupSelector").html("");
    
    if(allGroups.length != 0) {
        var z;
        for(z of allGroups) {
            let g = z;
            $('#groupSelector').append('<option value='+g.groupid+'>'+retrieve(g.groupid)+'</option>');
        }
    }
    else {
        $('#groupSelector').append('<option>No Groups Available</option>');
    }
});

socket.on("updateItemList", function(itemArrayFromServer) {
    clientItemArray = itemArrayFromServer;
    purchasedCount = 0;
    //console.log(items);
    $("#table-body").html("");

    //$("#groupID").text(retrieve(items[0].groupid));

    if(typeof(group) !== 'undefined') {
        $("#groupID").text(retrieve(group));
    }

    $("#date").text(formatDate(new Date()));

    var i;
    for(i of clientItemArray) {
        let t = i;
        var h = $("<tr id='"+t._id+"' class='table-item'><td></td><td class='"+t._id+"'>"+retrieve(t.name)+"</td><td class='"+t._id+"'>"+t.quantity+"</td><td class='"+t._id+"'>"+t.comments+"</td><td></td></tr>");
        var priorityButtonClass = t.priority ? 'truePriorityButton' : 'falsePriorityButton';
        var priorityText = t.priority ? "High" : "Low";
        var pb = $("<button class=" + priorityButtonClass + " type='button'>"+priorityText+"</button>");
        var editb = $("<button class='edit-button' type='button'>Edit</button>");
        var delb = $("<button class='delete-button' type='button'>Delete</button>");


       pb.click(function() {
            socket.emit("togglePriority", t._id, t.priority);
            console.log(t.name + " " + t.priority);
        });
        
        
        $(h.children()[0]).append(pb);
        $(h.children()[4]).append(editb).append(delb);

        editb.click(function() {
            $("#storeItemID").val(t._id);
            $("#editModalItemName").val(retrieve(t.name));
            $("#editModalItemQuantity").val(t.quantity);
            $("#editModalItemComment").val(t.comments);
            $("#editModalItemPriority").prop('checked', t.priority);
            $("#mainView").hide();
            $("#editItemModal").show();
        });

        delb.click(function() {
            currentItem = t;
        });
        
        $("#table-body").append(h);

        if(t.purchased == true) {
            //console.log("Changing background color to green");
            $("#"+t._id).css("background-color", "#7c7c7c");
            purchasedCount++;
        }
        else {
            //console.log("Changing the background color to blue");
            $("#"+t._id).css("background-color", "#90AFC5");
            console.log(purchasedCount);
        }

        $("."+t._id).click(function() {
            console.log("The item you are sending to the server is "+t.name+" and the purchased boolean is "+t.purchased);
            socket.emit("togglePurchased", t._id, t.purchased);
        });

    }
    console.log(purchasedCount);
    //purchasedCount = 0;
    updateClickHandlers();
});

//Nate
function updateClickHandlers() {
    $(".delete-button").click(function(event) {
        $("#confirmDeleteModal").show();
        $("#addItemModal").hide();
        $("#mainView").hide();
        $("#editItemModal").hide();
        $("#deleteItemName").text(retrieve(currentItem.name));
    });

    $("#cancelDeleteItemButton").click(function() {
        $("#mainView").show();
        $("#confirmDeleteModal").hide();
    });

    $("#confirmDeleteItemButton").click(function() {
        $("#mainView").show();
        $("#confirmDeleteModal").hide();
        socket.emit("deleteItem", currentItem._id);
    });
    //Nick added these
    $("#cancelDeleteAllItemsButton").click(function() {
        $("#mainView").show();
        $("#confirmDeleteAllModal").hide();
    });

    $("#confirmDeleteAllItemsButton").click(function() {
        $("#mainView").show();
        $("#confirmDeleteAllModal").hide();
        socket.emit("removePurchased");
    });

}

function startItAll() {

    //changeGroupModal
    //generateGroupButton
    //createGroupButton
    socket.emit("getGroups");

    if(typeof(group) === 'undefined') {     //All items are loaded and then filtered when group is specified
        socket.emit("getAllItems");
    }
    else {
        socket.emit("getGroupItems", cleanString(group));
    }

    $("#changeGroupModal").show();
    $("#mainView").hide();
    $("#addItemModal").hide();
    $("#editItemModal").hide();
    $("#confirmDeleteAllModal").hide();

    $("#addItemButton").click(function () {
        $("#mainView").hide();
        $("#addItemModal").show();
    });

    $("#addItemCancel").click(function () {
        $("#mainView").show();
        $("#addItemModal").hide();
        clearAllInputFields();
    });

    $("#modalItemSubmit").click(function () {
        if (!validateName($("#modalItemName").val())) {
            //TODO: Handle bad name input
        }
        else if (!validateQuantity($("#modalItemQuantity").val())) {
            //TODO: Handle bad quantity input
        }
        else {
            socket.emit("receiveItemFromClient",
                cleanString(group),
                cleanString($("#modalItemName").val()),
                $("#modalItemQuantity").val(),
                $("#modalItemComment").val(),
                $("#modalItemPriority").is(":checked")
            );
            $("#mainView").show();
            $("#addItemModal").hide();
            clearAllInputFields();
        }
    });

    $("#editModalItemSubmit").click(function () {
        if (!validateName($("#editModalItemName").val())) {
            //TODO: Handle bad name input
        }
        else if (!validateQuantity($("#editModalItemQuantity").val())) {
            //TODO: Handle bad quantity input
        }
        else {
            socket.emit("editItem",    //id, name, quantity, comments, priority
                $("#storeItemID").val(),
                cleanString($("#editModalItemName").val()),
                $("#editModalItemQuantity").val(),
                $("#editModalItemComment").val(),
                $("#editModalItemPriority").is(":checked")
            );
            $("#mainView").show();
            $("#editItemModal").hide();
            clearAllInputFields();
        }
    });

    $("#createGroupButton").click(function () {
        group = $("#groupSelector").val();
        //group = $("#changeGroupText").val();
        console.log(cleanString(group));
        //socket.emit("getAllItems");
        socket.emit("getGroupItems", cleanString(group));
        //TODO: handle the group value
        $("#changeGroupModal").hide();
        $("#mainView").show();
    });

    $("#generateGroupButton").click(function () {
        group = prompt("Please enter a new group name");
        //TODO: handle the group generation
        socket.emit("createGroupEntry", cleanString(group));
        //socket.emit("getGroupItems", cleanString(group));
        $("#changeGroupModal").hide();
        $("#mainView").show();
    });

    $("#changeGroupButton").click(function () {
        socket.emit("getGroups");
        $("#changeGroupModal").show();
        $("#mainView").hide();
        $("#addItemModal").hide();
    });

    $("#deleteGroupButton").click(function () {
        var delGroup = confirm("Are you sure you want to delete this group and all of its items?");
        if(delGroup == true) {
           socket.emit("deleteGroup", cleanString(group));
            $("#changeGroupModal").show();
            $("#mainView").hide();
        }
       // $("#changeGroupModal").show();
       // $("#mainView").hide();
       // $("#addItemModal").hide();
    });

    $("#editItemCancel").click(function() {
        $("#mainView").show();
        $("#editItemModal").hide();
    });

    $("#removeAllButton").click(function() {
        if(purchasedCount > 0) {
            $("#confirmDeleteAllModal").show();
            $("#mainView").hide();
        }
        else {
            alert("No items selected!");
        }
    });
}

function getModalItemPriority() {

    //return $("#modalItemPriority").prop('checked');
}

function clearAllInputFields() {
    $("#modalItemName").val("");
    $("#modalItemQuantity").val(1);
    $("#modalItemComment").val("");
    $("#modalItemPriority").prop('checked', false);
}

function getModalItemPriority() {
    return $("#modalItemPriority").prop('checked');
}

function clearAllInputFields() {
    $("#modalItemName").val("");
    $("#modalItemQuantity").val(1);
    $("#modalItemComment").val("");
    $("#modalItemPriority").prop('checked', false);
}


$(startItAll);


function validateName(name) {
    return (name.replace(/\s/g, '').length > 0); //Return true if not empty string or not all whitespace
}

function validateQuantity(quantity) {
    let str = quantity.toString();
    //console.log("STEP 1: " + str);
    let q = str.replace(/\s/g, '');
    //console.log("STEP 2: " + q);
    if (q.length < 1) return false;
    for (let i = 0; i < q.length; i++) {
        if (q[i] < '0' || q[i] > '9') return false;
    }
    //console.log("STEP 3: " + parseInt(q));
    if (parseInt(q) < 1) return false;
    return true;
}

// Takes a word, returns a string all lowercase separated by underscores
function cleanString(str) {
   return str.split(' ').filter(item => item.length > 0).map(word => word.toLowerCase()).join('_');
}

// Takes a lowercase word separated by underscores.
// Returns a string with spaces instead of underscores, with the first
// letter of each word capitalized
function retrieve(str) {
   return str.split('_').map(capitalizeFirst).join(' ');
}

function capitalizeFirst(word) {
   return word[0].toUpperCase() + word.substring(1);
}

function makeDate() {
    return formatDate(new Date());
}

function formatDate(date) {
    let ret = '';
    let month = date.getMonth() + 1;
    if (month < 10) month = '0' + month;
    ret += month + '-';
    let day = date.getDate();
    if (day < 10) day = '0' + day;
    ret += day + '-';
    ret += date.getFullYear();
    return ret;
}

function dateMillis(date) {
    return date.getTime();
}

function fixComment(comment) {
    if(typeof(comment) === 'undefined') {
        return "";
    }
}


exports.cleanString = cleanString;
exports.retrieve = retrieve;
exports.makeDate = makeDate;
exports.formatDate = formatDate;
exports.dateMillis = dateMillis;

