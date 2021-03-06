var socket = io();

var allGroups = [];

let group = "no_group_found";

var clientItemArray = [];

var currentItem;

var purchasedCount = 0;

socket.on("updateGroupList", function (groupArrayFromServer) {
    allGroups = groupArrayFromServer;
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

    if (items.length == 0)
        $("#table-body").append("<tr><td class='empty-table' colspan='5'>No Items in List</td></tr>")

    purchasedCount = 0;
    $("#content").height(400 + 53 * items.length);
    for (let t of items) {
        var h = $("<tr id='" + t._id + "' class='table-item'><td></td><td class='" + t._id + "'>" + retrieve(t.name) + "</td><td class='" + t._id + "'>" + t.quantity + "</td><td class='" + t._id + "'>" + t.comments + "</td><td></td></tr>");
        var priorityButtonClass = t.priority ? 'truePriorityButton' : 'falsePriorityButton';
        var priorityText = t.priority ? "High" : "Low";
        var pb = $("<button class=" + priorityButtonClass + " type='button'>" + priorityText + "</button>");
        var editb = $("<button class='styled-button2' type='button'>Edit</button>");
        var delb = $("<button class='styled-button2' type='button'>Delete</button>");

        pb.click(function () {
            socket.emit("togglePriority", group, t._id, t.priority);
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
            hideAll();
            $("#confirmDeleteModal").show();
            $("#deleteItemName").text(retrieve(currentItem.name));
        });

        $("#table-body").append(h);

        if (t.purchased == true) {
            purchasedCount++;
            $("#" + t._id).css("background-color", "#7c7c7c");
        } else {
            $("#" + t._id).css("background-color", "#90AFC5");
        }

        $("." + t._id).click(function () {
            socket.emit("togglePurchased", group, t._id, t.purchased);
        });

    }
    updateClickHandlers();
}

socket.on("updateItemList", function (items) {
    $("#table-body").html("");
    $("#groupID").text(retrieve(group).toUpperCase());
    $("#date").text(makeDate());
    updateGUI(items);
});

socket.on("forceClientCall", function (w) {
    socket.emit("getGroupItems", cleanString(group));
});

socket.on("forceOutOfList", function (w) {
    hideAll();
    $("#groupDeletedModal").show();
    group = 'no_group_found';
    socket.emit("changeRoom", group);
});

function updateClickHandlers() {
    $("#cancelDeleteItemButton").click(function () {
        hideAll();
        $("#mainView").show();
    });

    $("#confirmDeleteItemButton").click(function () {
        hideAll();
        $("#mainView").show();
        socket.emit("deleteItem", group, currentItem._id);
    });

    $("#cancelDeleteAllItemsButton").click(function () {
        hideAll();
        $("#mainView").show();
    });

    $("#confirmDeleteAllItemsButton").click(function () {
        hideAll();
        $("#mainView").show();
        socket.emit("removePurchased", group);
    });

    $("#cancelDeleteGroupButton").click(function () {
        hideAll();
        $("#mainView").show();
    });

    $("#confirmDeleteGroupButton").click(function () {
        socket.emit("deleteGroup", cleanString(group));
        hideAll();
        group = "no_group_found";
        socket.emit("changeRoom", group);
        $("#changeGroupModal").show();
    });

    $("#deleteGroupButton").click(function () {
        $("#deleteGroupName").text(retrieve(group));
        hideAll();
        $("#confirmDeleteGroupModal").show();
    });

    $("#cancelCreateNewGroupButton").click(function () {
        hideAll();
        $("#changeGroupModal").show();
    });

    $("#groupWasDeleted").click(function () {
        hideAll();
        $("#changeGroupModal").show();
    });
}

function hideAll() {
    hideAllModals();
    hideAllDivs();
}

function hideAllDivs() {
    $("#validateNewGroupDiv").hide();
    $("#validateGroupDiv").hide();
    $("#validateAddItemDiv").hide();
    $("#validateEditItemDiv").hide();
}

function hideAllModals() {
    $("#addItemModal").hide();
    $("#createNewGroupModal").hide();
    $("#changeGroupModal").hide();
    $("#editItemModal").hide();
    $("#confirmDeleteModal").hide();
    $("#confirmDeleteAllModal").hide();
    $("#confirmDeleteGroupModal").hide();
    $("#groupDeletedModal").hide();
    $("#mainView").hide();
}

function sortList(arr) {
    if (currentSort == sortingType.quantity) {
        arr = arr.sort(function (a, b) {
            if (parseInt(a.quantity) < parseInt(b.quantity)) return 1;
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
    } else {
        arr = arr.sort(function (a, b) {
            if (dateMillis(a.date) < dateMillis(b.date)) return 1;
            return -1;
        })
    }
    return arr;
}

function startItAll() {

    socket.emit("getGroupCollections");

    if (typeof (group) === 'undefined') { //All items are loaded and then filtered when group is specified
        console.log("ERRORR ERRORR EORR")
    } else {
        socket.emit("getGroupItems", group);
    }

    hideAll();
    $("#changeGroupModal").show();
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
        } else if (!validateQuantity($("#modalItemQuantity").val())) {
            $("#validateAddItemDiv").show();
        } else if (!validateComment($("#modalItemComment").val())) {
            $("#validateAddItemDiv").show();
        } else {
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
        if (!validateName($("#editModalItemName").val())) { // Has bad name
            $("#validateEditItemDiv").show();
        } else if (!validateQuantity($("#editModalItemQuantity").val())) { // Has bad quantity
            $("#validateEditItemDiv").show();
        } else if (!validateComment($("#editModalItemComment").val())) { // Has bad comment
            $("#validateEditItemDiv").show();
        } else {
            socket.emit("editItem", //id, name, quantity, comments, priority
                group,
                $("#storeItemID").val(),
                cleanString($("#editModalItemName").val()),
                $("#editModalItemQuantity").val(),
                $("#editModalItemComment").val(),
                $("#editModalItemPriority").is(":checked")
            );
            hideAll();
            $("#mainView").show();
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
        hideAll();
        resetSort();
        $("#mainView").show();
    });

    $("#generateGroupButton").click(function () {
        hideAll();
        $("#createNewGroupModal").show();
        $("#createNewGroupInput").val('');
    });

    $("#confirmCreateNewGroupButton").click(function () {
        if (!validateGroupName($("#createNewGroupInput").val())) {
            $("#validateNewGroupDiv").show();
        } else {
            let newGroup = cleanString($("#createNewGroupInput").val());
            group = newGroup;
            socket.emit("changeRoom", group);
            socket.emit("addNewGroup", group);
            socket.emit("getGroupItems", cleanString(group));
            hideAll();
            $("#mainView").show();
        }
    });

    $("#changeGroupButton").click(function () {
        socket.emit("getGroups");
        hideAll();
        $("#changeGroupModal").show();
        $("#changeGroupText").val('');
    });

    $("#editItemCancel").click(function () {
        hideAll();
        $("#mainView").show();
    });

    $("#removeAllButton").click(function () {
        if (purchasedCount > 0) {
            hideAll();
            $("#confirmDeleteAllModal").show();
        }
    });

    $("#table-quantity").click(function () {
        if (currentSort === sortingType.quantity) {
            resetSort();
        } else {
            currentSort = sortingType.quantity;
            $("#table-name").css('background-color', '#90AFC5');
            $("#table-priority").css('background-color', '#90AFC5');
            $("#table-quantity").css('background-color', '#66a0c9');
        }
        updateGUI(items);
    });

    $("#table-name").click(function () {
        if (currentSort === sortingType.name) {
            resetSort();
        } else {
            currentSort = sortingType.name;
            $("#table-name").css('background-color', '#66a0c9');
            $("#table-priority").css('background-color', '#90AFC5');
            $("#table-quantity").css('background-color', '#90AFC5');
        }
        updateGUI(items);
    });

    $("#table-priority").click(function () {
        if (currentSort === sortingType.priority) {
            resetSort();
        } else {
            currentSort = sortingType.priority;
            $("#table-name").css('background-color', '#90AFC5');
            $("#table-priority").css('background-color', '#66a0c9');
            $("#table-quantity").css('background-color', '#90AFC5');
        }
        updateGUI(items);
    });
}

$(startItAll);

function getModalItemPriority() {
    return $("#modalItemPriority").prop('checked');
}

function clearAllInputFields() {
    $("#modalItemName").val("");
    $("#modalItemQuantity").val(1);
    $("#modalItemComment").val("");
    $("#modalItemPriority").prop('checked', false);
}

function resetSort() {
    currentSort = sortingType.none;
    $("#table-name").css('background-color', '#90AFC5');
    $("#table-priority").css('background-color', '#90AFC5');
    $("#table-quantity").css('background-color', '#90AFC5');
}



