// this is by every possible combination....

// implementation of bijective numeration
// https://en.wikipedia.org/wiki/Bijective_numeration
function bijectiveString0(m, k) {
  if (m == 0) {
      return [];
  }
  let string = [];
  function f(x) {
    return Math.ceil(x) - 1;
  }
  let qn = m; // makes q0 correct
  while (qn != 0) {
    let qnInc = f(qn / k);
    let anInc = qn - qnInc*k;
    string.push(anInc - 1); // from 0 (the zero part of the name)
    qn = qnInc;
  }
  return string.reverse();
}

function numToCombo(m) {
    return bijectiveString0(m, lines.length);
}

function runCombos() {
  let answerMat = new SVG.Matrix(levels[level].answer);
  let fourLinesTenMoves = 1048576;
  for (let i=0; i<fourLinesTenMoves; i++) {
    let combo = numToCombo(i);
    combo.forEach(ind => reflect(lines[ind]));
    if (matEq(matrix, answerMat)) {
      return combo;
    }
    setLevel(level);
  }
}

// this is by a still brute force, slightly more mathematically informed
// strategy

// k only necessary to include zeroes for convenience
function factoradicString(m, k) {
    let power = 1;
    let string = [];
    for (let rad=1; rad<=k; rad++) {
      	let quot = Math.floor(m / rad);
      	let rem = m - quot * rad;
        string.push(rem);
        m = quot;
    }
    return string.reverse();
}
function lehmerCode(str) {
    let poss = [];
    for (let i=0; i<str.length; i++) {
        poss.push(i);
    }
    let combo = [];
    str.forEach(digit => {
        let element = poss.splice(digit, 1)[0];
        combo.push(element);
    });
    return combo;
}

function factorial(n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n-1);
}
function pairCombos() {
    let combos = [];
    for (let i=0; i<lines.length; i++) {
      	for (let j=0; j<lines.length; j++) {
          if (i != j) {
            combos.push([i, j]);
          }
        }
    }
    return combos;
}

// based off biject but with changing k
function triangleString(m, k) {
    if (m == 0) {
        return [];
    }
    let string = [];
    // "through floor" (2 -> 1, 2.5 -> 2)
    function f(x) {
        return Math.ceil(x) - 1;
    }
    let qn = m;
    while (qn != 0) {
        // "fancy mod": preserves division and through floor
        // divide value
        let qnInc = f(qn / k);
        // mod value
        let anInc = qn - qnInc*k;
        qn = qnInc;
        k = anInc;
        string.push(anInc - 1); // from 0 (the zero part of the name)
    }
    return string.reverse();
}
function square(mat) {
  	mat.e = 0;
  	mat.f = 0;
  	return mat;
}
function solver() {
    let pairs = pairCombos();
    let mats = pairs.map(([ind0, ind1]) => {
      	return square(getReflectionMatrix(lines[ind0])).multiply(
          square(getReflectionMatrix(lines[ind1])));
    });
	  let answerMat = square(new SVG.Matrix(levels[level].answer));
    let maxMoves = 12;
    // not entirely sure that sum squares is the correct algorithm here but
    // it's LIKE it and this is just for an upper bound so it's fine
    let bound = (maxMoves+1) * (maxMoves+2) * (2*maxMoves+1) / 6;
    for (let i=0; i<bound; i++) {
        let matrix = new SVG.Matrix;
        let seq = triangleString(i, 12);
        seq.forEach(ind => {
            matrix = mats[ind].multiply(matrix)
        })
      	console.log(matrix);
        if (matEq(matrix, answerMat)) {
          return seq.map(ind => pairs[ind]);
        }
    }
}

function arrEq(a, b) {
    return a.reduce((acc, x, i) => acc && x == b[i], true) && a.length == b.length;
}
function dCompare() {
    dFCompare(bijectiveString0, triangleStringBiject0);
}
function dFCompare(a, b) {
    for (let i=0; i<100; i++) {
        if (!arrEq(a(i, 12), b(i, 12))) {
            console.log(i, bijectiveString0(i, 12), triangleStringBiject0(i, 12));
        }
    }
}
function fPrint(f) {
    for (let i=0; i<100; i++) {
        console.log(i, f(i, 4));
    }
}

solver()
