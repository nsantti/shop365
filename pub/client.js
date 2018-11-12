
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


exports.cleanString = cleanString;
exports.retrieve = retrieve;
exports.retrieve = retrieve;

socket.on("getItemList", function(items) {
    console.log(items);
});

function startItAll() {
    socket.emit("getAllItems");
}

startItAll();