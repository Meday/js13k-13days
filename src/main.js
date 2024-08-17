import Renderer from './renderer.js';

const { Point, Sprite } = Renderer;

const stats = new Stats();
document.body.appendChild(stats.dom);

const view = document.getElementById('view');
const scene = Renderer(view, { scale: 1.0/3.0 });
const { gl } = scene;
console.log(gl);

scene.background(0.3, 0.3, 1, 0);

scene.camera.at.set(0, 0);
scene.camera.to.set(0);

let tileAtlasImage = new Image();
tileAtlasImage.src="src/atlas.png";

class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vec) {
    return new Vec2(vec.x + this.x, vec.y + this.y);
  }
}

const TILE_SIZE = 8;
const MAP_SIZE  = new Vec2(31, 23);
const MAP_POS   = new Vec2(8, 8);

const gameStart = () => {
  
  const tileAtlasTexture = scene.texture(tileAtlasImage, 1);
  // tileAtlasTexture.anchor = new Point(0.5);

  class TileResource {
    constructor(tileX, tileY) {
      this.frame = tileAtlasTexture.frame(new Point(tileX * TILE_SIZE, tileY * TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE));
    }
  }

  const TILE_MUD_0        = new TileResource(0, 0);
  const TILE_MUD_1        = new TileResource(0, 1);
  const TILE_MUD_2        = new TileResource(0, 2);
  const TILE_GRASS_0      = new TileResource(1, 0);
  const TILE_GRASS_1      = new TileResource(1, 1);
  const TILE_GRASS_2      = new TileResource(1, 2);
  const TILE_GRASS_3      = new TileResource(1, 3);
  const TILE_TREE_BOTTOM  = new TileResource(2, 0);
  const TILE_TREE_MIDDLE  = new TileResource(2, 1);
  const TILE_TREE_TOP     = new TileResource(2, 2);
  const TILE_TREE_SMALL   = new TileResource(2, 3);


  const layer = scene.layer(0);

  const mud_tiles = [TILE_MUD_0, TILE_MUD_1, TILE_MUD_2];
  
  for (let y = 0; y < MAP_SIZE.y; y++) {
    for (let x = 0; x < MAP_SIZE.x; x++) {

      const sprite = new Sprite(mud_tiles[Math.floor(Math.random() * mud_tiles.length)].frame);
      const tile_pos = new Vec2(x * TILE_SIZE + MAP_POS.x, y * TILE_SIZE + MAP_POS.y);

      sprite.position.set(tile_pos.x , tile_pos.y);
      // sprite.scale.set(4, 4);

      layer.add(sprite);
    }
  }

  const dbgRenderInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const glInfoText = gl.getParameter(dbgRenderInfo ? dbgRenderInfo.UNMASKED_RENDERER_WEBGL : gl.VENDOR);

  const infoDiv = document.getElementById('info');
  infoDiv.innerHTML = `Renderer: ${glInfoText}`;

  let add = false;

  view.onmousedown = () => {
    add = true;
  };
  view.ontouchstart = () => {
    add = true;
  };

  view.onmouseup = () => {
    add = false;
  };
  view.ontouchend = () => {
    add = false;
  };

  const gameLoop = () => {
    stats.begin();

    scene.render();
    stats.end();

    requestAnimationFrame(gameLoop);
  };

  gameLoop();
}

tileAtlasImage.onload = gameStart;