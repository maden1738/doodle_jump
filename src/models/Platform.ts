import { DIMENSIONS } from "../constants";

interface IPlatform {
     x: number;
     y: number;
     width: number;
     height: number;
     safe: boolean;
}

export class Platform implements IPlatform {
     x: number;
     y: number;
     width: number;
     height: number;
     safe: boolean;

     constructor(
          x: number,
          y: number,
          safe: boolean = true,
          width: number = DIMENSIONS.PLATFORM_WIDTH,
          height: number = DIMENSIONS.PLATFORM_HEIGHT
     ) {
          this.x = x;
          this.y = y;
          this.width = width;
          this.height = height;
          this.safe = safe;
     }
}
