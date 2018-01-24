import { Snake } from "./app/snake";

let board = document.getElementById('board');
let score = document.getElementById('score');

let game = new Snake(board, score);
game.start();