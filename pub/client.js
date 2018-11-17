
var socket = io();

var group;

/*socket.on("displayItemFromServer", function (name, quantity, comment, priority) {
    console.log("NAME: " + name + "\nQUANTITY: " + quantity + "\nCOMMENT: " + comment + "\nPRIORITY: " + priority);
});*/

socket.on("updateItemList", function(items) {
    $("#table-body").html("");

    //$("#groupID").text(retrieve(items[0].groupid));

    if(typeof(group) !== 'undefined') {
        $("#groupID").text(retrieve(group));
    }

    $("#date").text(formatDate(new Date()));

    var i;
    for(i of items) {
        let t = i;
        var h = $("<tr id='"+t._id+"' class='table-item'><td></td><td class='"+t._id+"'>"+retrieve(t.name)+"</td><td class='"+t._id+"'>"+t.quantity+"</td><td class='"+t._id+"'>"+t.comments+"</td><td></td></tr>");
        
        var pb = $("<button class='priority-button' type='button'>"+t.priority+"</button>");
        var editb = $("<button class='more-button' type='button'>Edit</button>");
        var delb = $("<button class='more-button' type='button'>Delete</button>");


       pb.click(function() {
            socket.emit("togglePriority", t._id, t.priority);
            console.log(t.name + " " + t.priority);
        });
        
        
        $(h.children()[0]).append(pb);
        $(h.children()[4]).append(editb).append(delb);

        editb.click(function() {
            $("#storeItemID").val(t._id);
            $("#editModalItemName").val(t.name);
            $("#editModalItemQuantity").val(t.quantity);
            $("#editModalItemComment").val(t.comments);
            $("#mainView").hide();
            $("#editItemModal").show();
        });

        delb.click(function() {
            var c = confirm("Are you sure?");
            if(c)
                socket.emit("deleteItem", t._id);
        });
        
        $("#table-body").append(h);

        if(t.purchased == true) {
            console.log("Changing background color to green");
            $("#"+t._id).css("background-color", "#99ff66");
        }
        else {
            console.log("Changing the background color to blue");
            $("#"+t._id).css("background-color", "#90AFC5");
        }

        $("."+t._id).click(function() {
            console.log("The item you are sending to the server is "+t.name+" and the purchased boolean is "+t.purchased);
            socket.emit("togglePurchased", t._id, t.purchased);
        });

    }


});


function startItAll() {

    //changeGroupModal
    //generateGroupButton
    //createGroupButton
    if(typeof(group) === 'undefined') {
        socket.emit("getAllItems");
    }
    else {
        socket.emit("getGroupItems", group);
    }

    $("#changeGroupModal").show();
    $("#mainView").hide();
    $("#addItemModal").hide();

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
                group,
                cleanString($("#modalItemName").val()),
                $("#modalItemQuantity").val(),
                $("#modalItemComment").val(),
                getModalItemPriority()
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
                getModalItemPriority()
            );
            $("#mainView").show();
            $("#addItemModal").hide();
            clearAllInputFields();
        }
    });

    $("#createGroupButton").click(function () {
        group = $("#changeGroupText").val();
        console.log(group);
        socket.emit("getGroupItems", group);
        //TODO: handle the group value
        $("#changeGroupModal").hide();
        $("#mainView").show();
    });

    $("#generateGroupButton").click(function () {
        //TODO: handle the group generation
        $("#changeGroupModal").hide();
        $("#mainView").show();
    });

    $("#changeGroupButton").click(function () {
        $("#changeGroupModal").show();
        $("#mainView").hide();
        $("#addItemModal").hide();
    });
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

