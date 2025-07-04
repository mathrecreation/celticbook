#!/usr/bin/env node
const fs = require('fs');

var celtic = require('./celtic/celtic.js');

/**
 * General utilities
 */

function getTimestamp () {
    const pad = (n,s=2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
    const d = new Date();
    return `${pad(d.getFullYear(),4)}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function writeFile(folder, name, content){
    let childFile = folder + "/"+name+".tex";
    fs.writeFile(childFile, content, function(err) {
        if(err) {
            return console.log("There was an error" + err);
            console.log("exiting");
            process.exit(1);
        }
    });
}

function oneXOne(){
    let grid = new celtic.Grid(2,2);
    grid.initialize();
    grid.borders();
    //connect nodes on secondary grid
    let knotDisplay = new celtic.PositiveKnotDisplay(grid, 20, 'white', 'darkblue');
    knotDisplay.init();
    return knotDisplay.buildTikZ();
}

function oneXTwoA(){
    let grid = new celtic.Grid(2,3);
    grid.initialize();
    grid.borders();
    //connect nodes on secondary grid
    let knotDisplay = new celtic.PositiveKnotDisplay(grid, 20, 'white', 'darkblue');
    knotDisplay.init();
    return knotDisplay.buildTikZ();
}

function oneXTwoB(){
    let grid = new celtic.Grid(2,3);
    grid.initialize();
    grid.borders();
    //connect nodes on secondary grid
    grid.from(1,1).to(3,1);
    let knotDisplay = new celtic.PositiveKnotDisplay(grid, 20, 'white', 'darkblue');
    knotDisplay.init();
    return knotDisplay.buildTikZ();
}


function oneXTwoC(){
    let grid = new celtic.Grid(2,3);
    grid.initialize();
    grid.borders();
    //connect nodes on secondary grid
    grid.from(2,0).to(2,2);
    let knotDisplay = new celtic.PositiveKnotDisplay(grid, 20, 'white', 'darkblue');
    knotDisplay.init();
    return knotDisplay.buildTikZ();
}


console.log("---------------------------");
console.log("Chapter 0: misc diagrams ");
console.log("---------------------------");

//set up folder for files
let folderName = 'ch0_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
}	catch (err) {
    console.error(err);
}

let name = "oneXone";
writeFile(folderName,name,oneXOne());

name = "oneXTwoA";
writeFile(folderName,name,oneXTwoA());

name = "oneXTwoB";
writeFile(folderName,name,oneXTwoB());

name = "oneXTwoC";
writeFile(folderName,name,oneXTwoC());

