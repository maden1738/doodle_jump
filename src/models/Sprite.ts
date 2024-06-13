import { DIMENSIONS } from "../constants";

interface ISprite {
     image: HTMLImageElement;
     x: number;
     y: number;
     width: number;
     height: number;
     radius: number;
     dx: number;
     dy: number;
}

export class Sprite implements ISprite {
     image: HTMLImageElement;
     x: number;
     y: number;
     width: number;
     height: number;
     radius: number;
     dx: number;
     dy: number;

     constructor(
          imagePath: string,
          x: number,
          y: number,
          width: number = DIMENSIONS.DOODLE_WIDTH,
          height: number = DIMENSIONS.DOODLE_HEIGHT
     ) {
          this.image = new Image();
          this.image.src = imagePath;
          this.x = x;
          this.y = y;
          this.width = width;
          this.height = height;
          this.radius = width / 2;
          this.dx = 0;
          this.dy = 0;
     }
}
