const grid = document.getElementById("grid")  //网格容器
const score = document.getElementById("score")  //分数显示区
const items = document.querySelectorAll(".item")  //所有可拖拽的物品
const level = {
  rows: 3,
  cols: 4,
  cell: 110,
  gap: 18,
  gridLeft: 55,
  gridTop: 55
}

// 创建格子
//网格共 12 个格，通过循环生成 div.cell 加入 grid
for (let i = 0; i < level.rows*level.cols; i++) {
  const c = document.createElement("div")
  c.className = "cell"
  grid.appendChild(c)
}

const CELL = level.cell   // 每个格子的宽/高（含内部内容区）
const GAP = level.gap     // 格子之间的间距
const GRID_LEFT = level.gridLeft
const GRID_TOP = level.gridTop
const occupied = new Map() // 记录每个格子被哪个物品占据
//物品的固定位置
const target = {

bottle:{row:0,col:1},
lipstick:{row:0,col:0},
phone:{row:2,col:2},
manicure:{row:1,col:2},
comb:{row:1,col:1},
ring:{row:2,col:0},

candle:{row:0,col:2},
smallmirror:{row:2,col:3},
letter:{row:2,col:1},
doll:{row:0,col:3},
bouquet:{row:1,col:3},
hairpin:{row:1,col:0}

}


// 初始位置
//所有物品绝对定位在左侧，纵向间隔 90px 排列
// 左侧物品固定错落摆放
const startPos = [

  { left: 35,  top: 30,  rotate: -6 },   // 🧴
  { left: 135, top: 45,  rotate: 5 },    // 💄
  { left: 60,  top: 155, rotate: -3 },   // 📱
  { left: 145, top: 220, rotate: 4 },    // 💅
  { left: 30,  top: 315, rotate: -7 },   // 🪮
  { left: 150, top: 355, rotate: 6 },    // 💍

  { left: 75,  top: 450, rotate: -4 },   // 🕯️
  { left: 150, top: 465, rotate: 5 },    // 🪞
  { left: 25,  top: 570, rotate: -6 },   // 💌
  { left: 120, top: 530, rotate: 3 },    // 🧸
  { left: 40,  top: 400, rotate: -5 },   // 🌹
  { left: 140, top: 125, rotate: 4 }     // 🎀

]

items.forEach((item, i) => {

  const p = startPos[i]

  item.style.left = p.left + "px"
  item.style.top = p.top + "px"

  item.style.transform = `rotate(${p.rotate}deg)`

})



let drag=null

let offsetX=0
let offsetY=0

let oldParent=null
let oldLeft=""
let oldTop=""


//记录鼠标相对于物品左上角的偏移量 offsetX/offsetY，保证拖拽时鼠标位置不变。
//将物品从原父容器移动到 document.body，使其可以自由跨越任何区域（突破 overflow: hidden 等限制）。
//使用 getBoundingClientRect() 获取的坐标是相对于视口的，
// 需要加上页面滚动量 (window.scrollX/Y) 才能转换为绝对定位的 left/top
items.forEach(

item=>{

item.addEventListener("mousedown", e => {
  e.preventDefault()
  drag = item

  const r = item.getBoundingClientRect()
  offsetX = e.clientX - r.left
  offsetY = e.clientY - r.top

  oldParent = item.parentElement
  oldLeft = item.style.left
  oldTop = item.style.top

  document.body.appendChild(item)
  item.style.left = window.scrollX + r.left + "px"
  item.style.top = window.scrollY + r.top + "px"

  // 随机旋转和放大效果
  const rotate = (Math.random() - 0.5) * 8
  item.style.transform = `translateY(-4px) scale(1.08) rotate(${rotate}deg)`
  item.style.zIndex = 999
})
}
)


//e.pageX/Y 是鼠标相对于文档的坐标，减去偏移量即得到物品应设置的 left/top
window.addEventListener("mousemove", e => {
  if (!drag) return
  drag.style.left = (e.pageX - offsetX) + "px"
  drag.style.top = (e.pageY - offsetY) + "px"
})

window.addEventListener("mouseup",()=>{ if(!drag)
return

const item=drag
drag=null


//计算物品中心点
const gridRect= grid.getBoundingClientRect()
const centerX= item.getBoundingClientRect().left + 40
const centerY= item.getBoundingClientRect().top + 40


//判断中心点是否在网格内
const inside = 
centerX > gridRect.left && centerX < gridRect.right &&
centerY > gridRect.top  && centerY < gridRect.bottom 


//把物品移回原来的父元素，恢复原先的位置和样式，拖拽动画移除。
if (!inside) {
  oldParent.appendChild(item)
  item.style.left = oldLeft
  item.style.top = oldTop
  item.style.transform = ""
  return
}

//将物品中心坐标转换为网格内部的相对坐标。
//由于每个格子占用的空间是 CELL + GAP（格子宽度 + 间隙），整除即可得到所在的行列索引
const localX = centerX - gridRect.left
const localY = centerY - gridRect.top
const col = Math.floor(localX / (CELL + GAP))
const row = Math.floor(localY / (CELL + GAP))
const key = `${row}-${col}`
const t = target[item.dataset.id]

if (row !== t.row || col !== t.col){
oldParent.appendChild(item)
item.style.left = oldLeft
item.style.top = oldTop
item.style.transform = ""
item.animate(
[
{transform:"translateX(-8px)"},
{transform:"translateX(8px)"},
{transform:"translateX(0)"}
],
{duration:180})

return}


//如果物品之前已经放在某个格子（有 data-slot 属性），先从 occupied 中释放旧格子，再将新格子标记为占用。
//用 dataset.slot 存储当前格子键，便于后续统计
if (item.dataset.slot) {
occupied.delete(item.dataset.slot)
}

occupied.set(key, item)
item.dataset.slot = key


//将物品移入 grid 容器。
//计算精确定位：col * (CELL+GAP) + 15，其中 15 是 (110-80)/2，让物品在格内居中。
//使用 Web Animations API 播放一个落地弹跳动画（缩放变化），结束后 transform 清空。
//调用 update() 刷新分数
grid.appendChild(item)

const ITEM_SIZE = 70
const OFFSET = (CELL - ITEM_SIZE) / 2

item.style.left = col * (CELL + GAP) + OFFSET + "px"
item.style.top = row * (CELL + GAP) + OFFSET + "px"

item.animate([
{transform:item.style.transform},
{transform:"translateY(6px) scale(.96)"},
{transform:"translateY(-2px) scale(1.03)"},
{transform:"translateY(0) scale(1)"}
],

{duration:260,easing:"ease-out"})

item.style.transform=""
update()
})


//统计所有拥有 data-slot 属性的物品数量（即已放入格子的数量），更新顶部提示。
// 当数量等于物品总数时显示获胜信息
function update(){
const n=document.querySelectorAll("[data-slot]").length
score.textContent= `已收纳 ${n}/${items.length}`

if(n===items.length){
document
.getElementById("win")
.classList.add("show")
}
}


//区域位置
function createArea(
className,
row,
col,
rowspan,
colspan
){

const area = document.createElement("div")

area.className = className

area.style.left = GRID_LEFT + col * (CELL + GAP) + "px"
area.style.top = GRID_TOP + row * (CELL + GAP) + "px"
area.style.width = CELL * colspan + GAP * (colspan - 1) + "px"
area.style.height = CELL * rowspan + GAP * (rowspan - 1) + "px"

return area
}


//创建区域
const table =
document.getElementById("table")

table.appendChild(
createArea("makeup-box", 0, 0, 2, 1)
)

table.appendChild(
createArea("skincare-box", 0, 1, 2, 2)
)

table.appendChild(
createArea("ring-box", 2, 0, 1, 1)
)


//
const backMenu =
document.getElementById("backMenu");

backMenu.addEventListener("click",()=>{

window.location.href="../menu.html";

});


//
const replay = document.getElementById("replay")

replay.onclick=()=>{
location.reload()
}

const next = document.getElementById("nextLevel")
next.onclick=()=>{
//window.location.href="level2.html"
alert("哦哦第二关我还没写!")
}

const back = document.getElementById("back")
back.onclick=()=>{
window.location.href="../menu.html"
}

window.addEventListener("load", () => {
  const loading = document.getElementById("loading");
  if (loading) loading.style.display = "none";
});

update()