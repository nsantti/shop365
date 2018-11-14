
var socket = io();

socket.on("displayItemFromServer", function (name, quantity, comment, priority) {
    console.log("NAME: " + name + "\nQUANTITY: " + quantity + "\nCOMMENT: " + comment + "\nPRIORITY: " + priority);
});

socket.on("getItemList", function (items) {
    console.log(items);
});

function startItAll() {
    socket.emit("getAllItems");
    socket.emit("getGroupItems");

    $("#addItemModal").hide();

    $("#addItemButton").click(function () {
        $("#mainView").hide();
        $("#addItemModal").show();
    });

    $("#addItemCancel").click(function () {
        $("#mainView").show();
        $("#addItemModal").hide();
    });

    //Ryan TODO: validate input before sending to server
    $("#modalItemSubmit").click(function () {
        $("#mainView").show();
        $("#addItemModal").hide();
        if (!validateName($("#modalItemName").val())) {
            //TODO: Handle bad name input
        }
        else if (!validateQuantity($("#modalItemQuantity").val())) {
            //TODO: Handle bad quantity input
        }
        else {
            socket.emit("receiveItemFromClient",
                $("#modalItemName").val(),
                $("#modalItemQuantity").val(),
                $("#modalItemComment").val(),
                $("#modalItemPriority").val()
            );
        }
    });
}

$(startItAll);

function validateName(name) {
    return (name.replace(/\s/g, '').length > 0); //Return true if not empty string or not all whitespace
}

function validateQuantity(quantity) {
    let str = quantity.toString();
    let q = str.replace(/\s/g, '');
    if (q.length < 1) return false;
    for (let i = 0; i < q.length; i++) {
        if (q[i] < '0' || q[i] > '9') return false;
    }
    //if (q.parseInt() < 1) return false;
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

socket.on("updateItemList", function(items) {
    $("#groupID").text(retrieve(items[0].groupid));

    let d = new Date();
    $("#date").text(formatDate(d));

    let i;
    for(i of items) {
        var h = $("<tr><td><input type='checkbox'/></td><td>"+retrieve(i.name)+"</td><td>"+i.quantity+"</td><td><input type='button' id='comments' value='Show Comments'/></td><td><input type='button' value='Menu'/></td></tr>");
		$("#itemList").append(h);
    }
    //console.log(items);
});

exports.cleanString = cleanString;
exports.retrieve = retrieve;
exports.makeDate = makeDate;
exports.formatDate = formatDate;
exports.dateMillis = dateMillis;

