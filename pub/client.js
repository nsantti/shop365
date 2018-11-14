
var socket = io();


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

function startItAll() {

    socket.emit("getGroupItems");
}

startItAll();


exports.cleanString = cleanString;
exports.retrieve = retrieve;
exports.makeDate = makeDate;
exports.formatDate = formatDate;
exports.dateMillis = dateMillis;

