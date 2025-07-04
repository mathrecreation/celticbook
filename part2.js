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
        string += list[i];;
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
// shifts a list so that the head is after the tail
function shift(list){
    let toShift = coerce(list.slice());
    let popped = toShift.pop();
    toShift.unshift(popped);
    return toShift;
}
// flips all horizontals (1) to verticals (2)
function flip(list){
    let start = coerce(list.slice());
    let flipped = [];
    for (var i of start){
        if (i===0){
            flipped.push(0)
        } else if (i === 1){
            flipped.push(2);
        } else {
            flipped.push(1);
        }
    }
    return flipped;
}
function hreflect4(list){
    let hreflected =[list[2],list[1],list[0],list[3]];
    return hreflected;
}
function vreflect4(list){
    let vreflected =[list[0],list[3],list[2],list[1]];
    return vreflected;
}
function allReflections(list){
    return allRotations(hreflect4(list)).concat(allRotations(vreflect4(list)));
}

// rotates a celtic cell signature by shift and flip
function rotate(list){
    return flip(shift(list));
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
    r1 = rotate(r1);
    if (same(r1,list)){
        return rotations;
    } else {
        rotations.push(r1);
    }
    r1 = rotate(r1);
    if (same(r1,list)){
        return rotations;
    } else {
        rotations.push(r1);
    }
    return rotations;
    // let rotations = [
    //     list,
    //     rotate(list),
    //     rotate(rotate(list)),
    //     rotate(rotate(rotate(list)))
    // ]
    return rotations;
}

/**
 * Chapter 1 -- the 15 celtic 2x2 cells
 */

let keep = []; // the signatures to keep
let exclude = []; // the rotated variants

// generate all signatures excluding rotated versions
let allTuples= [];
for (var a in [0,1,2]) {
    for (var b in [0,1,2]) {
        for (var c in [0,1,2]) {
            for (var d in [0,1,2]) {
                allTuples.push([a,b,c,d]);
            }
        }
    }
}
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

// generate 2x2 cell from its signature
function twoXtwoLaTeX(fourTuple){
    let grid = new celtic.Grid(3,3);
    grid.initialize();
    grid.borders();
    //connect nodes on secondary grid
    let first = fourTuple[0];
    if (first === 1){
        grid.from(1,1).to(3,1);
    } else if (first === 2){
        grid.from(2,0).to(2,2);
    }
    let second = fourTuple[1];
    if (second === 1){
        grid.from(2,2).to(4,2);
    } else if (second === 2){
        grid.from(3,1).to(3,3);
    }
    let third = fourTuple[2];
    if (third === 1){
        grid.from(1,3).to(3,3);
    } else if (third === 2){
        grid.from(2,2).to(2,4);
    }
    let fourth = fourTuple[3];
    if (fourth === 1){
        grid.from(0,2).to(2,2);
    } else if (fourth === 2){
        grid.from(1,1).to(1,3);
    }
    let knotDisplay = new celtic.PositiveKnotDisplay(grid, 20, 'white', 'darkblue');
    knotDisplay.init();
    return knotDisplay.buildTikZ();
}

console.log("---------------------------");
console.log("Chapter 1: celtic 2x2 cells");
console.log("---------------------------");

//set up folder for files
let folderName = 'ch1_generated_files';
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
let mainFile = 'ch1_list.tex';

for( let i = 0; i < keep.length; i++){
    let sig = keep[i];
    let knot = twoXtwoLaTeX(sig);
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

console.log("---------------------------");
console.log("Chapter 2:ALL celtic 2x2 cells");
console.log("---------------------------");

//set up folder for files
folderName = 'ch2_generated_files';
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
mainFile = 'ch2_list.tex';

for( let i = 0; i < keep1.length; i++){
    let sig = keep1[i];
    let knot = twoXtwoLaTeX(sig);
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