function randomChar(chars) {
  return chars[Math.floor(Math.random() * chars.length)];
}

function generateTicketId() {

  const year =
    new Date().getFullYear().toString().slice(-2);

  const hex =
    "0123456789ABCDEF";

  const alpha =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const vowel =
    "AEIOU";

  const alphanum =
    alpha + "0123456789";

  return (
    "NP-" +
    year +
    randomChar(hex) +
    randomChar(hex) +
    randomChar(alphanum) +
    randomChar(alphanum) +
    randomChar(vowel) +
    randomChar(alpha) +
    randomChar(alpha) +
    Math.floor(Math.random() * 10) +
    Math.floor(Math.random() * 10)
  );
}

module.exports = {
  generateTicketId
};