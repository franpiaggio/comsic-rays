import * as THREE from 'three'

function mapRange(value, a, b, c, d) {
    value = (value - a) / (b - a);
    return c + value * (d - c);
}
  
function randomBtw(a,b){
    return mapRange(fxrand(),0,1,a,b)
}

function randomFromList(items) {
    return items[Math.floor(fxrand() * items.length)];
}
const pickAndRemove = (array) => {
    while(array.length){
       const random = Math.floor(fxrand() * array.length);
       return array.splice(random, 1)[0];
    }
};
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
function isMobile(){
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
}

const pallete = [
    ["#845EC2", "#D65DB1", "#FF6F91",  "#FF9671"],
    ["#845EC2", "#D65DB1", "#FF6F91",  "#FF9671"],
    [0xef476f, 0xffd166, 0x06d6a0, 0x118ab2],
    [0xf08080, 0xf4978e, 0xffdab9, 0xe5383b],
    [0x5800FF, 0x5800FF, 0x72FFFF, 0x00D7FF],
    [0x7678ed, 0x3d348b],
    [0x7678ed, 0x3d348b, 0xf35b04],
    [0xfe938c, 0xe6b89c, 0xead2ac, 0x9cafb7, 0x4281a4],
    [0xffe66d, 0xff6b6b, 0xf7fff7, 0x4ecdc4, 0x1a535c],
    [0x6667ab, 0xcc2936, 0xf1bf98, 0xeee5e9, 0x580aff, 0x86a59c], 
    [0x143F6B, 0xF55353, 0xFEB139, 0xF6F54D], 
    [0x7579E7, 0x9AB3F5, 0xA3D8F4, 0xA3D8F4], 
    [0x851DE0, 0xAA26DA, 0xC355F5, 0xF1FA3C], 
    [0xFF5D9E, 0x8F71FF, 0x82ACFF, 0x8BFFFF], 
    [0xD34848, 0xFF8162, 0xFFCD60, 0xFFCD60, 0xFFFA67], 
    [0x35013F, 0xB643CD, 0xFFCD60, 0xA91079], 
    [0x7C83FD, 0x96BAFF, 0x7DEDFF, 0x88FFF7],
    [0x143F6B, 0xF55353, 0xFEB139, 0xF6F54D],
    [0xFF9090, 0xFFCF7F, 0xFFFA62, 0x89C4FF],
]

function randomPointInSphere(radius) {
    const v = new THREE.Vector3();
    const x = randomBtw( -1, 1 );
    const y = randomBtw( -1, 1 );
    const z = randomBtw( -1, 1 );
    const normalizationFactor = 1 / Math.sqrt( x * x + y * y + z * z );
  
    v.x = x * normalizationFactor * radius;
    v.y = y * normalizationFactor * radius;
    v.z = z * normalizationFactor * radius;
  
    return v;
}

export {mapRange, randomBtw, randomFromList, pickAndRemove, shuffle, isMobile, pallete, randomPointInSphere}