
const months = [
{year:2026,month:2,name:"March"},
{year:2026,month:3,name:"April"},
{year:2026,month:4,name:"May"},
{year:2026,month:5,name:"June"},
{year:2026,month:6,name:"July"}
];

function buildCalendar(){

const container=document.getElementById("calendar-container");

months.forEach(m=>{

const monthDiv=document.createElement("div");
monthDiv.className="month";

const title=document.createElement("h2");
title.innerText=m.name+" 2026";

const grid=document.createElement("div");
grid.className="calendar";

let firstDay=new Date(m.year,m.month,1).getDay();
let daysInMonth=new Date(m.year,m.month+1,0).getDate();

for(let i=0;i<firstDay;i++){
let blank=document.createElement("div");
blank.className="day";
grid.appendChild(blank);
}

for(let d=1;d<=daysInMonth;d++){

let dayDiv=document.createElement("div");
dayDiv.className="day";

let dateDiv=document.createElement("div");
dateDiv.className="date";
dateDiv.innerText=d;
dayDiv.appendChild(dateDiv);

let dateStr=`${m.year}-${String(m.month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

events.filter(e=>e.date===dateStr).forEach(ev=>{
let evDiv=document.createElement("div");
evDiv.className="event "+ev.kid;
evDiv.innerText=ev.title+" ("+ev.location+")";
dayDiv.appendChild(evDiv);
});

grid.appendChild(dayDiv);
}

monthDiv.appendChild(title);
monthDiv.appendChild(grid);

container.appendChild(monthDiv);

});

}

buildCalendar();
