const level1 = document.querySelector("[data-level='1']")

level1.addEventListener("click",()=>{

window.location.href="./levels/level1.html"

})

const level2 = document.querySelector("[data-level='2']")

level2.addEventListener("click",()=>{

window.location.href="./levels/level2.html"

})

document
.getElementById("back")
.addEventListener("click",()=>{

window.location.href="./index.html"

})