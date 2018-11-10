
function cleanString(str) {
   return str.split(' ').filter(item => item.length > 0).map(word => word.toLowerCase()).join('_');
}

function retrieve(str) {
   return str.split('_').map(capitalizeFirst).join(' ');

}

function capitalizeFirst(word) {
   return word[0].toUpperCase() + word.substring(1);
}

exports.cleanString = cleanString;
exports.retrieve = retrieve;