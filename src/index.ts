import { Snake } from "./app/snake";

let game = new Snake(document.getElementById('board'), document.getElementById('score'));
game.start();