

function numberToChar(n){
    return String.fromCharCode(65 + parseInt(n));
}

function formatAlternative(alternativeText, alternativeIndex){
    return numberToChar(alternativeIndex) + ") " + alternativeText;
}

export { numberToChar, formatAlternative}