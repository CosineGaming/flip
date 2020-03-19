use approx::{abs_diff_eq};
use lazy_static::lazy_static;
use ndarray::{arr2, s, stack, Array2, ArrayView2, Axis};
use rayon::prelude::*;

type M2 = Array2<f64>;

lazy_static! {
    static ref LEVEL_26_ANSWER: M2 = arr2(&[
        #[allow(clippy::unreadable_literal)]
        [0.6106926463383254, -0.7918677236182143, 102.80083691920044],
        #[allow(clippy::unreadable_literal)]
        [0.7918677236182146, 0.6106926463383255, 46.69157747803904]
    ]);
    static ref LEVEL_24_ANSWER: M2 = arr2(&[
        #[allow(clippy::unreadable_literal)]
        [-0.24615384615384622, -0.9692307692307695, 76.15384615384615],
        #[allow(clippy::unreadable_literal)]
        [0.9692307692307695, -0.24615384615384622, 76.76923076923077]
    ]);
    static ref IDENTITY2: M2 = arr2(&[[1., 0.], [0., 1.]]);
    static ref IDENTITY3: M2 = arr2(&[[1., 0., 0.], [0., 1., 0.], [0., 0., 1.]]);
}
const LEVEL_24_LINES: [[isize; 4]; 4] = [
    [20, 0, 0, 100],
    [50, 0, 0, 100],
    [10, 0, 90, 70],
    [0, 70, 100, -50],
];
const LEVEL_26_LINES: [[isize; 4]; 4] = [
    [0, 10, 50, 90],
    [50, 0, 0, 100],
    [0, 60, 100, 0],
    [0, 40, 100, -10],
];
// this isn't threads, rayon manages threads, it's just a workaround for
// no infinities
const CHUNKS: usize = 64;
const EPSILON: f64 = 64. * f64::EPSILON;

fn super_floor(a: usize, b: usize) -> usize {
    let floor = a / b;
    if floor * b == a {
        floor - 1
    } else {
        floor
    }
}

// this is by a still brute force, slightly more mathematically informed
// strategy

// k only necessary to include zeroes for convenience
fn factoradic_string(mut m: usize, k: usize) -> Vec<usize> {
    let mut string = vec![];
    for rad in 1..=k {
        let quot = m / rad;
        let rem = m - quot * rad;
        string.push(rem);
        m = quot;
    }
    string.into_iter().rev().collect()
}
fn factorial(n: usize) -> usize {
    if n <= 1 {
        1
    } else {
        n * factorial(n - 1)
    }
}
fn lehmer_code<T>(i: usize, mut poss: Vec<T>) -> Vec<T> {
    let mut combo = vec![];
    for digit in factoradic_string(i, poss.len()) {
        let element = poss.remove(digit);
        combo.push(element);
    }
    combo
}

fn pair_combos(num_lines: usize) -> Vec<(usize, usize)> {
    let mut combos = vec![];
    for i in 0..num_lines {
        for j in 0..num_lines {
            if i != j {
                combos.push((i, j));
            }
        }
    }
    combos
}

// based off biject but with changing k
// https://en.wikipedia.org/wiki/Bijective_numeration
fn triangle_string(m: usize, mut k: usize) -> Vec<usize> {
    if m == 0 {
        return vec![];
    }
    let mut string = vec![];
    let mut qn = m;
    while qn != 0 {
        // divide value
        let qn_inc = super_floor(qn, k);
        // mod value
        let an_inc = qn - qn_inc * k;
        qn = qn_inc;
        k = an_inc;
        string.push(an_inc - 1); // from 0 (the zero part of the name)
    }
    string.into_iter().rev().collect()
}

fn square(mat: &M2) -> ArrayView2<f64> {
    mat.slice(s![0..=1, 0..=1])
}
fn extend(mat: &M2) -> M2 {
    stack!(Axis(0), mat.view(), arr2(&[[0., 0., 1.]]))
}

fn check_combo(combo: &[usize], mats: &[M2], answer: &M2) -> bool {
    let mut matrix = IDENTITY2.clone();
    for ind in combo {
        matrix = square(&mats[*ind]).dot(&matrix)
    }
    abs_diff_eq!(&matrix, answer, epsilon = EPSILON)
}

fn permutations(pairs: &[(usize, usize)], mats: &[&M2], answer: M2) -> Vec<Vec<usize>> {
    // every permutation of pairs
    // even though we properly paralellize combinations this ends up being
    // the slower part of the process so we want to parallel it too
    (0..factorial(pairs.len())).into_iter().filter_map(|i| {
        let mut matrix = IDENTITY3.clone();
        let seq = lehmer_code(i, (0..pairs.len()).collect());
        for i in &seq {
            matrix = mats[*i].dot(&matrix);
        }
        println!("com {:?}\n{}\n{}\n--------------", seq, matrix, answer);
        if abs_diff_eq!(matrix, answer, epsilon = EPSILON) {
            Some(seq.into_iter()
                .flat_map(|ind| vec![pairs[ind].0, pairs[ind].1])
                .collect())
        } else {
            None
        }
    }).collect()
}

fn pair_to_mat(x: &(usize, usize), lines: [[isize; 4]; 4]) -> M2 {
    extend(&get_reflection_matrix(&lines[x.1]))
        .dot(&extend(&get_reflection_matrix(&lines[x.0])))
}

fn main() {
    const LINES: [[isize; 4]; 4] = LEVEL_26_LINES;
    let answer = &LEVEL_26_ANSWER;
    let pairs = pair_combos(LINES.len());
    let mats: Vec<M2> = pairs
        .iter()
        .map(|pair| pair_to_mat(pair, LINES))
        .collect();
    let square_answer = square(&answer).to_owned();
    for i in (0..).step_by(CHUNKS) {
        (i..i + CHUNKS).into_par_iter().for_each(|i| {
            let combo = triangle_string(i, 12);
            if check_combo(&combo, &mats, &square_answer) {
                let as_pairs: Vec<(usize, usize)> = combo.iter().map(|ind| pairs[*ind]).collect();
                let as_mats: Vec<&M2> = combo.iter().map(|ind| &mats[*ind]).collect();
                println!("naive combo found: {:?}", as_pairs);
                let permutes = permutations(&as_pairs, &as_mats, extend(&answer));
                if permutes.len() != 0 {
                    println!("true solutions {:?}", permutes);
                    println!("---------------------------------------------");
                }
            }
        });
    }
}

// translated from game.js
fn get_reflection_matrix(line: &[isize]) -> M2 {
    match slope(line) {
        Some(m) if m != 0. => {
            let b = line[1] as f64 - m * line[0] as f64;
            let q1 = m + (1. / m);
            let q2 = 1. + m * m;
            // Matricized version of http://martin-thoma.com/reflecting-a-point-over-a-line/
            // 1 3 5
            // 2 4 6
            arr2(&[
                [2. / m / q1 - 1., 2. / q1, -2. * b / q1],
                [2. * m / q2, 2. * m * m / q2 - 1., 2. * b / q2],
            ])
        }
        None => {
            // Vertical line flip
            arr2(&[[-1., 0., 2. * line[0] as f64], [0., 1., 0.]])
        }
        Some(_) => {
            // Horizontal line flip
            arr2(&[[1., 0., 0.], [0., -1., 2. * line[1] as f64]])
        }
    }
}

fn slope(line: &[isize]) -> Option<f64> {
    if line[2] == 0 {
        None
    } else {
        Some(line[3] as f64 / line[2] as f64)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn check_combo_24_known() {
        const SOLN: [usize; 6] = [1, 3, 2, 0, 3, 0];
        let mats: Vec<M2> = LEVEL_24_LINES
            .iter()
            .map(|line| get_reflection_matrix(line))
            .collect();
        assert!(check_combo(
            &SOLN,
            &mats,
            &square(&LEVEL_24_ANSWER).to_owned()
        ));
    }
    #[test]
    fn check_permute_24_known() {
        let pairs = [(1, 3), (2, 0), (3, 0)];
        let mats: Vec<M2> = pairs.iter().map(|pair| pair_to_mat(pair, LEVEL_24_LINES)).collect();
        let mats_ref: Vec<&M2> = mats.iter().map(|x| x).collect();
        assert_eq!(permutations(
            &pairs,
            &mats_ref,
            extend(&LEVEL_24_ANSWER),
        ), [[1, 3, 2, 0, 3, 0]]);
    }
    #[test]
    fn level_26_redundant_combo() {
        const SOLN: [usize; 16] = [0, 1, 1, 0, 0, 3, 2, 0, 2, 0, 2, 0, 2, 0, 0, 1];
        //const SOLN: [usize; 14] = [0, 3, 2, 0, 2, 0, 2, 0, 2, 1]
        //const SOLN: [usize; 14] = [0, 1, 1, 0, 0, 3, 2, 0, 2, 0, 2, 0, 1, 2]
        //const SOLN: [usize; 10] = [0, 3, 2, 0, 2, 0, 2, 0, 1, 2]
        let mats: Vec<M2> = LEVEL_26_LINES
            .iter()
            .map(|line| get_reflection_matrix(line))
            .collect();
        assert!(check_combo(
            &SOLN,
            &mats,
            &square(&LEVEL_26_ANSWER).to_owned()
        ));
    }
    #[test]
    fn level_26_failed_10_move_combo() {
        const MISSED_SOLN: [usize; 10] = [0, 3, 2, 0, 2, 0, 2, 0, 2, 1];
        let mats: Vec<M2> = LEVEL_26_LINES
            .iter()
            .map(|line| get_reflection_matrix(line))
            .collect();
        assert!(check_combo(
            &MISSED_SOLN,
            &mats,
            &square(&LEVEL_26_ANSWER).to_owned()
        ));
    }
    #[test]
    fn level_26_failed_10_move_permute() {
        const PAIRS: [(usize, usize); 5] = [(0, 3), (2, 0), (2, 0), (2, 0), (2, 1)];
        let mats: Vec<M2> = PAIRS.iter().map(|pair| pair_to_mat(pair, LEVEL_26_LINES)).collect();
        let mats_ref: Vec<&M2> = mats.iter().map(|x| x).collect();
        assert!(permutations(
            &PAIRS,
            &mats_ref,
            extend(&LEVEL_26_ANSWER),
        ).len() > 0);
    }
    #[test]
    fn eqs() {
        let a: M2 = arr2(&[[0.6106926463383254, -0.7918677236182144, 102.80083691920042],
         [0.7918677236182146, 0.6106926463383255, 46.69157747803905],
         [0., 0., 1.]]);
        let b: M2 = arr2(&[[0.6106926463383254, -0.7918677236182143, 102.80083691920044],
         [0.7918677236182146, 0.6106926463383255, 46.69157747803904],
         [0., 0., 1.]]);
         assert!(abs_diff_eq!(a, b, epsilon = EPSILON));
    }
    #[test]
    fn eqs_adjusted() {
        // adjusted to be exactly-equal
        let a: M2 = arr2(&[[0.6106926463383254, -0.7918677236182143, 102.80083691920044],
         [0.7918677236182146, 0.6106926463383255, 46.69157747803904],
         [0., 0., 1.]]);
        let b: M2 = arr2(&[[0.6106926463383254, -0.7918677236182143, 102.80083691920044],
         [0.7918677236182146, 0.6106926463383255, 46.69157747803904],
         [0., 0., 1.]]);
         assert!(abs_diff_eq!(a, b, epsilon = EPSILON));
    }

}
