
const bool = false;
let hello = "Not required";

if(bool){
    console.log(hello);
}else{
    hello = require("./test").default;
    console.log(hello.hello);
}