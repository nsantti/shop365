var socket = io();

let group = "test_group";

var currentItem;

var items = [];

var sortingType = {
    quantity: 0,
    name: 1,
    priority: 2,
    none: 3
}

var currentSort;
/*socket.on("displayItemFromServer", function (name, quantity, comment, priority) {
    console.log("NAME: " + name + "\nQUANTITY: " + quantity + "\nCOMMENT: " + comment + "\nPRIORITY: " + priority);
});*/

function updateGUI(arr) {
    $("#table-body").html("");
    items = sortList(arr);
    console.log(items);
    for (i of items) {
        let t = i;
        var h = $("<tr id='" + t._id + "' class='table-item'><td></td><td class='" + t._id + "'>" + retrieve(t.name) + "</td><td class='" + t._id + "'>" + t.quantity + "</td><td class='" + t._id + "'>" + t.comments + "</td><td></td></tr>");
        var priorityButtonClass = t.priority ? 'truePriorityButton' : 'falsePriorityButton';
        var priorityText = t.priority ? "High" : "Low";
        var pb = $("<button class=" + priorityButtonClass + " type='button'>" + priorityText + "</button>");
        var editb = $("<button class='edit-button' type='button'>Edit</button>");
        var delb = $("<button class='delete-button' type='button'>Delete</button>");


        pb.click(function () {
            socket.emit("togglePriority", t._id, t.priority);
            console.log(t.name + " " + t.priority);
        });


        $(h.children()[0]).append(pb);
        $(h.children()[4]).append(editb).append(delb);

        editb.click(function () {
            $("#storeItemID").val(t._id);
            $("#editModalItemName").val(retrieve(t.name));
            $("#editModalItemQuantity").val(t.quantity);
            $("#editModalItemComment").val(t.comments);
            $("#editModalItemPriority").prop('checked', t.priority);
            $("#mainView").hide();
            $("#editItemModal").show();
            $("#editModalItemName").focus();
        });

        delb.click(function () {
            currentItem = t;
        });

        $("#table-body").append(h);

        if (t.purchased == true) {
            console.log("Changing background color to green");
            $("#" + t._id).css("background-color", "#7c7c7c");
        } else {
            console.log("Changing the background color to blue");
            $("#" + t._id).css("background-color", "#90AFC5");
        }

        $("." + t._id).click(function () {
            console.log("The item you are sending to the server is " + t.name + " and the purchased boolean is " + t.purchased);
            socket.emit("togglePurchased", t._id, t.purchased);
        });

    }

    updateClickHandlers();
}

socket.on("updateItemList", function(items) {
    $("#table-body").html("");
    $("#groupID").text(retrieve(group).toUpperCase());
    $("#date").text(makeDate());
    updateGUI(items);
});

socket.on("forceClientCall", function(w) {
    socket.emit("getGroupItems", group);
});

//Nate
function updateClickHandlers() {
    $(".delete-button").click(function (event) {
        $("#confirmDeleteModal").show();
        $("#mainView").hide();
        $("#deleteItemName").text(retrieve(currentItem.name));
    });

    $("#cancelDeleteItemButton").click(function () {
        $("#mainView").show();
        $("#confirmDeleteModal").hide();
    });

    $("#confirmDeleteItemButton").click(function () {
        $("#mainView").show();
        $("#confirmDeleteModal").hide();
        socket.emit("deleteItem", currentItem._id);
    });

    $("#cancelDeleteAllItemsButton").click(function () {
        $("#mainView").show();
        $("#confirmDeleteAllModal").hide();
    });

    $("#confirmDeleteAllItemsButton").click(function () {
        $("#mainView").show();
        $("#confirmDeleteAllModal").hide();
        socket.emit("removePurchased");
    });

}

//Nate
function sortList(arr) {
    if (currentSort == sortingType.quantity) {
        console.log("SORTING BY QUANTITY");
        arr = arr.sort(function (a, b) {
            if (a.quantity < b.quantity) return 1;
            return -1;
        });
    } else if (currentSort == sortingType.name) {
        arr = arr.sort(function (a, b) {
            if (a.name > b.name) return 1;
            return -1;
        });
    } else if (currentSort == sortingType.priority) {
        arr = arr.sort(function (a, b) {
            if (b.priority && !a.priority) return 1;
            return -1;
        })
    }
    return arr;
}

function startItAll() {

    //changeGroupModal
    //generateGroupButton
    //createGroupButton

    if (typeof (group) === 'undefined') { //All items are loaded and then filtered when group is specified
        //socket.emit("getAllItems");
        console.log("ERRORR ERRORR EORR")
    } else {
        socket.emit("getGroupItems", group);
    }

    $("#changeGroupModal").show();
    $("#mainView").hide();
    $("#addItemModal").hide();
    $("#confirmDeleteAllModal").hide();
    $("#changeGroupText").focus();
    $("#changeGroupText").val('');

    $("#addItemButton").click(function () {
        $("#mainView").hide();
        $("#addItemModal").show();
        $("#modalItemName").focus();
    });

    $("#addItemCancel").click(function () {
        $("#mainView").show();
        $("#addItemModal").hide();
        clearAllInputFields();
    });

    $("#modalItemSubmit").click(function () {
        if (!validateName($("#modalItemName").val())) {
            //TODO: Handle bad name input
        } else if (!validateQuantity($("#modalItemQuantity").val())) {
            //TODO: Handle bad quantity input
        } else {
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
        } else if (!validateQuantity($("#editModalItemQuantity").val())) {
            //TODO: Handle bad quantity input
        } else {
            socket.emit("editItem", //id, name, quantity, comments, priority
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
        let temp = $("#changeGroupText").val().toLowerCase();
        if (temp == '') {
            group = 'test_group'; 
        }
        else {
            group = cleanString(temp);
        } 
        socket.emit("changeRoom", group);
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
        $("#changeGroupText").val('');
        $("#mainView").hide();
        $("#addItemModal").hide();
    });

    $("#editItemCancel").click(function () {
        $("#mainView").show();
        $("#editItemModal").hide();
    });

    $("#editItemCancel").click(function () {
        $("#mainView").show();
        $("#editItemModal").hide();
    });

    $("#removeAllButton").click(function () {
        //socket.emit("removePurchased");
        $("#confirmDeleteAllModal").show();
        $("#mainView").hide();
    });

    $("#table-quantity").click(function () {
        currentSort = sortingType.quantity;
        $("#table-name").css('background-color', '#90AFC5');
        $("#table-priority").css('background-color', '#90AFC5');
        $("#table-quantity").css('background-color', '#66a0c9');
        updateGUI(items);
    });

    $("#table-name").click(function () {
        currentSort = sortingType.name;
        $("#table-name").css('background-color', '#66a0c9');
        $("#table-priority").css('background-color', '#90AFC5');
        $("#table-quantity").css('background-color', '#90AFC5');
        updateGUI(items);
    });

    $("#table-priority").click(function () {
        currentSort = sortingType.priority;
        $("#table-name").css('background-color', '#90AFC5');
        $("#table-priority").css('background-color', '#66a0c9');
        $("#table-quantity").css('background-color', '#90AFC5');
        updateGUI(items);
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
    if (typeof (comment) === 'undefined') {
        return "";
    }
}


exports.cleanString = cleanString;
exports.retrieve = retrieve;
exports.makeDate = makeDate;
exports.formatDate = formatDate;
exports.dateMillis = dateMillis;