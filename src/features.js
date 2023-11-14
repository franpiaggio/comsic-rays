import { randomFromList } from "./utils"
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(fxrand() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
const shapes = [
    {
        id: 1,
        name: "Sphere",
        morph: true
    },
    // {
    //     id: 2,
    //     name: "TorusKnot",
    //     morph: false
    // },
    {
        id: 3,
        name: "Octahedron",
        morph: false
    },
    {
        id: 4,
        name: "Torus",
        morph: false
    }
]
function getShape(){
    return randomFromList(shuffle(shapes));
}


export { getShape }