let date = new Date();
const getDay = function getDay(){
    var options = {
        weekday: "long",
    };
  
    return date.toLocaleDateString("en", options)
 
}

module.exports.getDay = getDay