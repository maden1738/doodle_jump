import "./style.css";
import { Sprite } from "./models/Sprite";
import doodleSprite from "./assets/doodle.png";
import { DIMENSIONS } from "./constants";
import { Platform } from "./models/Platform";
import getRandomArbitrary from "./utils/randomNumberGenerator";

const canvas = document.querySelector("#gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = 500;
canvas.height = 700;

let highScore = parseInt(localStorage.getItem("high-score") || "0");

const GRAVITY = 0.5;
const JUMP_STRENGTH = -15;
let minimumSpace = 50;
let score = 0;
let gameStarted = false;
let gameOver = false;
let myReq: number;
let isPaused = false;
let maxHeight = canvas.height;

const gameContainer = document.querySelector(".game-container") as HTMLElement;
const startScreen = document.querySelector(".start-screen") as HTMLElement;
const startGameBtn = document.getElementById(
     "start-button"
) as HTMLButtonElement;
const gameOverAudio = document.getElementById(
     "game-over-audio"
) as HTMLAudioElement;

gameContainer.style.display = "none";
startGameBtn.addEventListener("click", () => {
     startScreen.style.display = "none";
     gameContainer.style.display = "flex";
     Game();
});

const scoreSpan = document.getElementById("score") as HTMLSpanElement;
const highScoreSpan = document.getElementById("high-score") as HTMLSpanElement;

function Game() {
     scoreSpan.innerHTML = String(score);
     highScoreSpan.innerHTML = String(highScore);

     // inital platform
     const platforms: Platform[] = [];
     for (let i = 13; i > 0; i--) {
          const x = getRandomArbitrary(
               20,
               canvas.width - DIMENSIONS.DOODLE_WIDTH - 20
          );
          const y = i * minimumSpace; // gap between initial platforms
          platforms.push(new Platform(x, y));
     }

     const doodle = new Sprite(
          doodleSprite,
          canvas.width / 2 - DIMENSIONS.DOODLE_WIDTH / 2,
          canvas.height - DIMENSIONS.DOODLE_HEIGHT
     );

     function handleGameOver() {
          const gameoverScreen = document.querySelector(
               ".gameover-screen"
          ) as HTMLElement;
          gameoverScreen.style.display = "block";
          const finalScore = document.getElementById(
               "final-score"
          ) as HTMLElement;
          finalScore.innerHTML = String(score);

          if (score > highScore) {
               highScore = score;
               localStorage.setItem("high-score", String(highScore));
          }

          const finalHighScoreSpan = document.getElementById(
               "final-high-score"
          ) as HTMLSpanElement;
          finalHighScoreSpan.innerHTML = String(highScore);
          const playagainBtn = document.getElementById(
               "play-again"
          ) as HTMLButtonElement;
          playagainBtn.addEventListener("click", () => {
               location.reload();
          });
     }

     function draw() {
          if (!isPaused) {
               ctx.clearRect(0, 0, canvas.width, canvas.height);
               ctx.fillStyle = "#fafafa";
               ctx.fillRect(0, 0, canvas.width, canvas.height);

               platforms.forEach((platform) => {
                    // differentiating safe and unsafe platforms by color
                    if (platform.safe) {
                         ctx.fillStyle = "#000";
                    } else {
                         ctx.fillStyle = "#BB2124";
                    }
                    ctx.fillRect(
                         platform.x,
                         platform.y,
                         platform.width,
                         platform.height
                    );
                    if (
                         // falling
                         doodle.dy > 0 &&
                         // AABB Collision Detection
                         doodle.x < platform.x + platform.width &&
                         doodle.x + doodle.width > platform.x &&
                         doodle.y < platform.y + platform.height &&
                         doodle.y + doodle.height > platform.y
                         //   player.y + player.height > platform.y && // Player's feet are below the top of the platform
                         // player.y + player.height < platform.y + platform.height && // Player's feet are above the bottom of the platform
                         // player.x + player.width > platform.x && // Player's right side is right of the platform's left side
                         // player.x < platform.x + platform.width) { // Player's left side is left of the platform's right side
                    ) {
                         if (platform.safe) {
                              gameStarted = true;
                              canvas.style.borderBottom = "10px solid #bb2124";
                              doodle.y = platform.y - doodle.height;
                              doodle.dy = JUMP_STRENGTH;
                         } else {
                              gameOver = true;
                         }
                    }
               });

               // if doodle reaches centre move existing platforms down and generate new platforms
               if (doodle.dy < 0 && doodle.y < canvas.height / 2) {
                    platforms.forEach((platform, index) => {
                         platform.y -= doodle.dy;
                         if (platform.y > canvas.height) {
                              platforms.splice(index, 1);
                         }
                    });
                    if (platforms[platforms.length - 1].y > 0) {
                         // normal platforms
                         platforms.push(
                              new Platform(
                                   getRandomArbitrary(
                                        20,
                                        canvas.width -
                                             DIMENSIONS.DOODLE_WIDTH -
                                             20
                                   ),
                                   platforms[platforms.length - 1].y -
                                        minimumSpace
                              )
                         );
                         // bad platorms
                         if (score && score % 10 === 0) {
                              platforms.push(
                                   new Platform(
                                        getRandomArbitrary(
                                             20,
                                             canvas.width -
                                                  DIMENSIONS.DOODLE_WIDTH -
                                                  20
                                        ),
                                        platforms[platforms.length - 1].y,
                                        false
                                   )
                              );
                         }
                         minimumSpace = Math.min(
                              minimumSpace + 0.7,
                              DIMENSIONS.MAX_SEPARATION_SPACE
                         );
                         console.log(minimumSpace);

                         score++;
                         scoreSpan.innerHTML = String(score);
                    }
               } else {
                    doodle.y += doodle.dy;
               }

               // draw doodle
               ctx.drawImage(
                    doodle.image,
                    doodle.x,
                    doodle.y,
                    doodle.width,
                    doodle.height
               );
               doodle.dy += GRAVITY; // gravity
               doodle.x += doodle.dx;

               if (doodle.y < maxHeight) {
                    maxHeight = doodle.y;
               }

               // initial bounce
               if (doodle.y + doodle.height > canvas.height) {
                    doodle.y = canvas.height - doodle.height;
                    doodle.dy = JUMP_STRENGTH;
                    if (gameStarted) {
                         gameOver = true;
                    }
               }

               if (gameOver) {
                    cancelAnimationFrame(myReq);
                    gameOverAudio.play();
                    handleGameOver();
                    return;
               }

               // warp throughside boundaries
               if (doodle.x + doodle.width < 0) {
                    doodle.x = canvas.width;
               } else if (doodle.x > canvas.width) {
                    doodle.x = -doodle.width;
               }
          }

          myReq = requestAnimationFrame(draw);
     }

     draw();

     window.addEventListener("keydown", (event) => {
          if (event.code === "ArrowLeft") {
               doodle.dx = -8;
          } else if (event.code === "ArrowRight") {
               doodle.dx = 8;
          } else if (event.code === "Space") {
               isPaused = !isPaused; // Toggle the pause state
          }
     });

     // dx has value only when key is pressed otherwise 0
     window.addEventListener("keyup", () => {
          doodle.dx = 0;
     });
}
