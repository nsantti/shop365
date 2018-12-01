function validateName(name) {
    return (name.replace(/\s/g, '').length > 0 && !isTooLong(name)); //Returns true if not empty string, not all whitespace, and is not too long
}

function validateGroupName(name) {
    if (cleanString(name) == cleanString("No Group Found")) return false;
    if (includes(cleanString(name))) return false;
    return (name.replace(/\s/g, '').length > 0);
}

function includes(name) {
    for (let i = 0; i < allGroups.length; i++) {
        if (allGroups[i].name == name) return true;
    }
    return false;
}

function validateQuantity(quantity) {
    let str = quantity.toString();
    let q = str.replace(/\s/g, '');
    if (q.length < 1 || q.length >= 15) return false;
    for (let i = 0; i < q.length; i++) {
        if (q[i] < '0' || q[i] > '9') return false;
    }
    if (parseInt(q) < 1) return false;
    return true;
}

function validateComment(comment) {
    return (!isTooLong(comment));
}

function isTooLong(inputString) { //Max 15 characters per word
    var arrayOfWords = inputString.split(' ');
    for (let i = 0; i < arrayOfWords.length; i++) {
        if (arrayOfWords[i].length >= 15) {
            return true;
        }
    }
    return false;
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
    return new Date(date).getTime();
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
exports.validateName = validateName;
exports.validateQuantity = validateQuantity;
exports.validateComment = validateComment;
exports.isTooLong = isTooLong;
exports.validateGroupName = validateGroupName;
exports.fixComment = fixComment;