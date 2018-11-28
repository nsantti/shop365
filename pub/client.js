var socket = io();

var allGroups = [];

let group = "no_group_found";

var clientItemArray = [];

var currentItem;

var purchasedCount = 0;

socket.on()

socket.on("updateGroupList", function (groupArrayFromServer) {
    allGroups = groupArrayFromServer;
    //console.log(groupArrayFromServer);
    // console.log(allGroups);
    //console.log(allGroups[0].groupid);
    $("#groupSelector").html("");

    if (allGroups.length != 0) {
        $('#createGroupButton').prop('disabled', false).css('opacity', 1);
        var z;
        for (z of allGroups) {
            let g = z;
            $('#groupSelector').append('<option value=' + g.name + '>' + retrieve(g.name) + '</option>');
        }
    }
    else {
        $('#createGroupButton').prop('disabled', true).css('opacity', 0.5);
        $('#groupSelector').append('<option>No Groups Available</option>');
    }
});

var currentItem;

var items = [];

var sortingType = {
    quantity: 0,
    name: 1,
    priority: 2,
    none: 3
}

var currentSort;

function updateGUI(arr) {
    $("#table-body").html("");
    items = sortList(arr);
    purchasedCount = 0;

    if($("#mainView").is(":visible")) {
        $("#content").height(400 + 53*items.length);
        $("#mainView").height(400 + 53*items.length);
    }

    if(items.length == 0)
        $("#table-body").append("<tr><td class='empty-table' colspan='5'>No Items to Show</td></tr>");

    for (i of items) {
        let t = i;
        var h = $("<tr id='" + t._id + "' class='table-item'><td></td><td class='" + t._id + "'>" + retrieve(t.name) + "</td><td class='" + t._id + "'>" + t.quantity + "</td><td class='" + t._id + "'>" + t.comments + "</td><td></td></tr>");
        var priorityButtonClass = t.priority ? 'truePriorityButton' : 'falsePriorityButton';
        var priorityText = t.priority ? "High" : "Low";
        var pb = $("<button class=" + priorityButtonClass + " type='button'>" + priorityText + "</button>");
        var editb = $("<button class='edit-button' type='button'>Edit</button>");
        var delb = $("<button class='delete-button' type='button'>Delete</button>");


        pb.click(function () {
            socket.emit("togglePriority", group, t._id, t.priority);
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
            purchasedCount++;
            //console.log("Changing background color to gray");
            $("#" + t._id).css("background-color", "#7c7c7c");
        } else {
            // console.log("Changing the background color to blue");
            $("#" + t._id).css("background-color", "#90AFC5");
        }

        $("." + t._id).click(function () {
            //console.log("The item you are sending to the server is " + t.name + " and the purchased boolean is " + t.purchased);
            console.log("Toggling purchased");
            socket.emit("togglePurchased", group, t._id, t.purchased);
        });

    }
    console.log(purchasedCount);
    //purchasedCount = 0;
    updateClickHandlers();
}

socket.on("updateItemList", function (items) {
    $("#table-body").html("");
    $("#groupID").text(retrieve(group).toUpperCase());
    $("#date").text(makeDate());
    console.log("Item array coming from server")
    console.log(items);
    updateGUI(items);
});

socket.on("forceClientCall", function (w) {
    //console.log("forceClientCall");
    socket.emit("getGroupItems", cleanString(group));
});

socket.on("forceOutOfList", function (w) {
    $("#changeGroupModal").show();
    $("#mainView").hide();
    $("#addItemModal").hide();
    $("#confirmDeleteAllModal").hide();
    //alert("The group has been deleted by another member");
});

//Nate
function updateClickHandlers() {
    $(".delete-button").click(function (event) {
        $("#confirmDeleteModal").show();
        $("#addItemModal").hide();
        $("#mainView").hide();
        $("#editItemModal").hide();
        $("#deleteItemName").text(retrieve(currentItem.name));
    });

    $("#cancelDeleteItemButton").click(function () {
        $("#mainView").show();
        $("#confirmDeleteModal").hide();
    });

    $("#confirmDeleteItemButton").click(function () {
        $("#mainView").show();
        $("#confirmDeleteModal").hide();
        socket.emit("deleteItem", group, currentItem._id);
    });
    //Nick added these
    $("#cancelDeleteAllItemsButton").click(function () {
        $("#mainView").show();
        $("#confirmDeleteAllModal").hide();
    });

    $("#confirmDeleteAllItemsButton").click(function () {
        $("#mainView").show();
        $("#confirmDeleteAllModal").hide();
        socket.emit("removePurchased", group);
    });

    $("#cancelDeleteGroupButton").click(function() {
        $("#mainView").show();
        $("#confirmDeleteGroupModal").hide();
    });

    $("#confirmDeleteGroupButton").click(function() {
        socket.emit("deleteGroup", cleanString(group));
        $("#changeGroupModal").show();
        $("#mainView").hide();
        $("#confirmDeleteGroupModal").hide();
    });

    $("#deleteGroupButton").click(function () {
        $("#deleteGroupName").text(retrieve(group));
        $("#mainView").hide();
        $("#confirmDeleteGroupModal").show();
    });

    $("#cancelCreateNewGroupButton").click(function() {
        $("#createNewGroupModal").hide();
        $("#changeGroupModal").show();
        $("#validateNewGroupDiv").hide();
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

    // socket.emit("getGroups");
    socket.emit("getGroupCollections");

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
        $("#validateAddItemDiv").hide();
        clearAllInputFields();
    });

    $("#modalItemSubmit").click(function () {
        if (!validateName($("#modalItemName").val())) {
            $("#validateAddItemDiv").show();
        }
        else if (!validateQuantity($("#modalItemQuantity").val())) {
            $("#validateAddItemDiv").show();
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
            $("#validateAddItemDiv").hide();
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
                group,
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
        let temp = $("#groupSelector").val().toLowerCase();
        if (temp == '') {
            group = 'test_group';
        }
        else {
            group = cleanString(temp);
        }
        socket.emit("changeRoom", group);
        //socket.emit("getGroupItems", group);
        //TODO: handle the group value
        $("#changeGroupModal").hide();
        $("#mainView").show();
    });

    $("#generateGroupButton").click(function () {
        // group = prompt("Please enter a new group name");
        // group = cleanString(group);
        // //TODO: handle the group generation
        // socket.emit("changeRoom", group);
        // socket.emit("addNewGroup", group);
        //socket.emit("getGroupItems", cleanString(group));
        $("#createNewGroupModal").show();
        $("#changeGroupModal").hide();
        $("#mainView").hide();
        $("#createNewGroupInput").val('');
    });

    $("#confirmCreateNewGroupButton").click(function() {
        let newGroup = cleanString($("#createNewGroupInput").val());
        //TODO: validate the newGroup variable
        if (true) {
            group = newGroup;
            socket.emit("changeRoom", group);
            socket.emit("addNewGroup", group);
            socket.emit("getGroupItems", cleanString(group));
            $("#createNewGroupModal").hide();
            $("#mainView").show();
        } else {
            $("#validateNewGroupDiv").show();
        }
       

    });

    $("#changeGroupButton").click(function () {
        socket.emit("getGroups");
        $("#changeGroupModal").show();
        $("#changeGroupText").val('');
        $("#mainView").hide();
        $("#addItemModal").hide();
    });

    

    $("#editItemCancel").click(function () {
        $("#mainView").show();
        $("#editItemModal").hide();
    });

    $("#removeAllButton").click(function () {
        if(purchasedCount > 0) {
            $("#confirmDeleteAllModal").show();
            $("#mainView").hide();
        }
        else {
            alert("No Items Selected!")
        }
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