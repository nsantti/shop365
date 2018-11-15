
var socket = io();

var group = "test_group";

/*socket.on("displayItemFromServer", function (name, quantity, comment, priority) {
    console.log("NAME: " + name + "\nQUANTITY: " + quantity + "\nCOMMENT: " + comment + "\nPRIORITY: " + priority);
});*/

socket.on("updateItemList", function(items) {
    $("#table-body").html("");

    //$("#groupID").text(retrieve(items[0].groupid));

    $("#groupID").text(retrieve(group));

    let d = new Date();
    $("#date").text(formatDate(d));

    var i;
    for(i of items) {
        let t = i;
        var h = $("<tr class='table-item'><td></td><td>"+retrieve(i.name)+"</td><td>"+i.quantity+"</td><td>"+i.comments+"</td><td></td></tr>");
        
        var pb = $("<button class='priority-button' type='button'>"+i.priority+"</button>");
        var mb = $("<button class='more-button' type='button'>More</button><div id='"+t._id+"'class='more-button-content'>Dropdown Content</div>");


       pb.click(function() {
            $("#table-body tr").remove();
            socket.emit("togglePriority", t._id, t.priority);
            //socket.emit("getGroupItems");
            console.log(t.name + " " + t.priority);
        });
        
        /*mb.hover(function() {
            $("#"+t._id).show();
		});

        $("#"+t._id).hover(function() {
            $("#"+t._id).show();
        });*/
        
        $(h.children()[0]).append(pb);
        $(h.children()[4]).append(mb);
        
        $("#table-body").append(h);
    }


});


function startItAll() {
    //socket.emit("getAllItems");

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
                group,
                $("#modalItemName").val(),
                $("#modalItemQuantity").val(),
                $("#modalItemComment").val(),
                $("#modalItemPriority").is(':checked')
            );
            $("#table-body tr").remove();
        }
    });

    socket.emit("getGroupItems");
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

