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

/**
 * Utility functions for generating celtic cell signatures
 */

function same(list1, list2) {
    return (list1.join(',')=== list2.join(','));
}

function signature(list){
    let string = "";
    for (let i = 0; i < list.length; i++) {
        string += list[i];
    }
    return string;
}

function printListOfLists(lists){
    let string = " | ";
    for (let i = 0; i < lists.length; i++) {
        string += lists[i] + " | ";
    }
    return string;
}

function listInListOfLists(list, listOfLists){
    for (let i = 0; i < listOfLists.length; i++){
        let listFromList = listOfLists[i];
        if (same(listFromList, list)){
            return true;
        }
    }
    return false;
}

function coerce(list){
    let numberList=[];
    for (let i = 0; i < list.length; i++){
        numberList.push(parseInt(list[i]));
    }
    return numberList;
}
// rotates the 2x3 grid 180. There are 7 positions being rotated, the
// sixth spot is in the centre, and remains in the same position
function shift7(list){
    let toShift = [
        list[3],
        list[4],
        list[5],
        list[0],
        list[1],
        list[2],
        list[6],
    ]
    return toShift;

}

function hreflect7(list){
    let hreflected =[list[4],list[3],list[2],list[1],list[0],list[5],list[6]];
    return hreflected;
}
function vreflect7(list){
    let vreflected =[list[1],list[0],list[5],list[4],list[3],list[2],list[6]];
    return vreflected;
}
function allReflections(list){
    return allRotations(hreflect7(list)).concat(allRotations(vreflect7(list)));
}

// rotates a celtic cell signature by shift and flip
function rotate(list){
    return (shift7(list));
}
// generates all other rotations of a given signature
function allRotations(list){
    let rotations = [list]
    let r1 =  rotate(list);
    if (same(r1,list)){
        return rotations;
    } else {
        rotations.push(r1);
    }
    return rotations;
}

/**
 * Chapter 1 -- the celtic 2x3 cells
 */

let keep = []; // the signatures to keep
let exclude = []; // the rotated variants

// generate all signatures excluding rotated versions
let allTuples= [];
/**
 *  We will only generate tuples with 5,6,7 crossings
 */
let positions = [0,1,2,3,4,5,6];
let baseTuple = [0,0,0,0,0,0,0];
let sixCrossings = [];
for (let i = 0; i < 7; i++){
    let tuple1 = baseTuple.slice();
    tuple1[i] = 1;
    sixCrossings.push(tuple1);
    tuple1 = baseTuple.slice();
    tuple1[i] = 2;
    sixCrossings.push(tuple1);
}

let fiveCrossingPairs = [];
for (let i = 0; i < 7; i++){
    for (let j = i+1; j < 7; j++){
        fiveCrossingPairs.push([i,j]);
    }
}
let fiveCrossings = [];
for (let i = 0; i < fiveCrossingPairs.length; i++){
    let pair = fiveCrossingPairs[i];

    let tuple1 = baseTuple.slice();
    tuple1[pair[0]] = 1;
    tuple1[pair[1]] = 1;
    fiveCrossings.push(tuple1);

    tuple1 = baseTuple.slice();
    tuple1[pair[0]] = 1;
    tuple1[pair[1]] = 2;
    fiveCrossings.push(tuple1);

    tuple1 = baseTuple.slice();
    tuple1[pair[0]] = 2;
    tuple1[pair[1]] = 1;
    fiveCrossings.push(tuple1);

    tuple1 = baseTuple.slice();
    tuple1[pair[0]] = 2;
    tuple1[pair[1]] = 2;
    fiveCrossings.push(tuple1);
}


console.log(printListOfLists(sixCrossings));
console.log((sixCrossings.length));

allTuples = sixCrossings;
// console.log("total possible tuples: " + allTuples.length);
let keep1 = [];
console.log("removing duplicates");
for (let i = 0; i < allTuples.length; i++){
    let candidate = allTuples[i];
    // console.log("testing " + candidate);
    if (!listInListOfLists(candidate, keep1)){
        //keep1.push(coerce(candidate));
        let rotations = allRotations(candidate.slice());
        for (let j = 0; j < rotations.length; j++){
            keep1.push(coerce(rotations[j]));
        }
    }
}
console.log("with duplicates removed: " + keep1.length);


console.log("removing rotations");
for (let i = 0; i < allTuples.length; i++){
    let candidate = allTuples[i];
    //   console.log("testing " + candidate);
    let rotations = allRotations(candidate.slice());
    //   console.log(" - for " + candidate +" rotations are: " + printListOfLists(rotations));
    let duplicateFound = false;
    for (let i = 0; i < rotations.length; i++){
        let r = rotations[i];
        if (listInListOfLists(r, keep)){
            //         console.log(" -- for " + candidate + ", found rotation: " + r);
            duplicateFound=true;
            break;
        }
    }
    if (!duplicateFound && !listInListOfLists(candidate, keep)){
        keep.push(coerce(candidate));
    }
}
console.log("tuples with rotations removed: "+ keep.length);

console.log("removing reflections");
let reflectsRemoved = []
for (let i = 0; i < keep.length; i++){
    let candidate = keep[i];
    //console.log("testing " + candidate);
    let reflections = allReflections(candidate.slice());
    //console.log(" - for " + candidate +" reflections are: " + printListOfLists(reflections));
    let duplicateFound = false;
    for (let i = 0; i < reflections.length; i++){
        let r = reflections[i];
        if (listInListOfLists(r, reflectsRemoved)){
            //   console.log(" -- for " + candidate + ", found reflection: " + r);
            duplicateFound=true;
            break;
        }
    }
    if (!duplicateFound && !listInListOfLists(candidate, reflectsRemoved)){
        // console.log("--- adding " +candidate );
        reflectsRemoved.push(coerce(candidate));
    }
}
console.log("reflections removed: " + reflectsRemoved.length);
//keep = reflectsRemoved; // let's not remove reflections
// generate 2x3 cell from its signature
function twoXthreeLaTeX(septTuple){
    //console.log("building: " + septTuple);
    let grid = new celtic.Grid(3,4);
    grid.initialize();
    grid.borders();
    //connect nodes on secondary grid
    let first = septTuple[0];
    if (first === 1){
        grid.from(1,1).to(3,1);
    } else if (first === 2){
        grid.from(2,0).to(2,2);
    }
    let second = septTuple[1];
    if (second === 1){
        grid.from(3,1).to(5,1);
    } else if (second === 2){
        grid.from(4,0).to(4,2);
    }
    let third = septTuple[2];
    if (third === 1){
        grid.from(4,2).to(6,2);
    } else if (third === 2){
        grid.from(5,1).to(5,3);
    }
    let fourth = septTuple[3];
    if (fourth === 1){
        grid.from(3,3).to(5,3);
    } else if (fourth === 2){
        grid.from(4,2).to(4,4);
    }
    let fifth = septTuple[4];
    if (fifth === 1){
        grid.from(1,3).to(3,3);
    } else if (fifth === 2){
        grid.from(2,2).to(2,4);
    }
    let sixth = septTuple[5];
    if (sixth === 1){
        grid.from(0,2).to(2,2);
    } else if (sixth === 2){
        grid.from(1,1).to(1,3);
    }
    let seventh = septTuple[6];
    if (seventh === 1){
        grid.from(2,2).to(4,2);
    } else if (seventh === 2){
        grid.from(3,1).to(3,3);
    }
    let knotDisplay = new celtic.PositiveKnotDisplay(grid, 20, 'white', 'darkblue');
    knotDisplay.init();
    return knotDisplay.buildTikZ();
}

console.log("---------------------------");
console.log("Chapter 3: some 2x3 cells");
console.log("---------------------------");

//set up folder for files
let folderName = 'ch3_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
}	catch (err) {
    console.error(err);
}

let mainDoc = new celtic.LaTeXDoc();
let mainFile = 'ch3_list.tex';

for( let i = 0; i < keep.length; i++){
    let sig = keep[i];
    let knot = twoXthreeLaTeX(sig);
    let childFile = folderName+"/"+signature(sig)+".tex";
    mainDoc.input(childFile);

    fs.writeFile(childFile, knot, function(err) {
        if(err) {
            return console.log("There was an error" + err);
            console.log("exiting");
            process.exit(1);
        }
    });
}


fs.writeFile(mainFile, mainDoc.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
        process.exit(1);
    }
});

/**
 * Chapter 4
 */

allTuples = fiveCrossings;
// console.log("total possible tuples: " + allTuples.length);
keep1 = [];
keep =[];
console.log("removing duplicates");
for (let i = 0; i < allTuples.length; i++){
    let candidate = allTuples[i];
    // console.log("testing " + candidate);
    if (!listInListOfLists(candidate, keep1)){
        //keep1.push(coerce(candidate));
        let rotations = allRotations(candidate.slice());
        for (let j = 0; j < rotations.length; j++){
            keep1.push(coerce(rotations[j]));
        }
    }
}
console.log("with duplicates removed: " + keep1.length);

console.log("removing rotations");
for (let i = 0; i < allTuples.length; i++){
    let candidate = allTuples[i];
    //   console.log("testing " + candidate);
    let rotations = allRotations(candidate.slice());
    //   console.log(" - for " + candidate +" rotations are: " + printListOfLists(rotations));
    let duplicateFound = false;
    for (let i = 0; i < rotations.length; i++){
        let r = rotations[i];
        if (listInListOfLists(r, keep)){
            //         console.log(" -- for " + candidate + ", found rotation: " + r);
            duplicateFound=true;
            break;
        }
    }
    if (!duplicateFound && !listInListOfLists(candidate, keep)){
        keep.push(coerce(candidate));
    }
}
console.log("tuples with rotations removed: "+ keep.length);

console.log("removing reflections");
reflectsRemoved = []
for (let i = 0; i < keep.length; i++){
    let candidate = keep[i];
    //console.log("testing " + candidate);
    let reflections = allReflections(candidate.slice());
    //console.log(" - for " + candidate +" reflections are: " + printListOfLists(reflections));
    let duplicateFound = false;
    for (let i = 0; i < reflections.length; i++){
        let r = reflections[i];
        if (listInListOfLists(r, reflectsRemoved)){
            //   console.log(" -- for " + candidate + ", found reflection: " + r);
            duplicateFound=true;
            break;
        }
    }
    if (!duplicateFound && !listInListOfLists(candidate, reflectsRemoved)){
        // console.log("--- adding " +candidate );
        reflectsRemoved.push(coerce(candidate));
    }
}
console.log("reflections removed: " + reflectsRemoved.length);

//set up folder for files
folderName = 'ch4_generated_files';
console.log("building at " + getTimestamp ());
console.log("creating folder if needed");
try {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
}	catch (err) {
    console.error(err);
}

mainDoc = new celtic.LaTeXDoc();
mainFile = 'ch4_list.tex';

for( let i = 0; i < keep.length; i++){
    let sig = keep[i];
    let knot = twoXthreeLaTeX(sig);
    let childFile = folderName+"/"+signature(sig)+".tex";
    mainDoc.input(childFile);

    fs.writeFile(childFile, knot, function(err) {
        if(err) {
            return console.log("There was an error" + err);
            console.log("exiting");
            process.exit(1);
        }
    });
}


fs.writeFile(mainFile, mainDoc.build(), function(err) {
    if(err) {
        return console.log("There was an error" + err);
        console.log("exiting");
        process.exit(1);
    }
});
