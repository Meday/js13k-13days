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

class Vec2 extends Point {
  add(vec) {
    return new Vec2(vec.x + this.x, vec.y + this.y);
  }
}

const TILE_SIZE = 8;
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
  const TILE_TREE_TOP     = new TileResource(2, 0);
  const TILE_TREE_MIDDLE  = new TileResource(2, 1);
  const TILE_TREE_BOTTOM  = new TileResource(2, 2);
  const TILE_TREE_SMALL   = new TileResource(2, 3);
  const TILE_CASTLE_TL    = new TileResource(3, 0);
  const TILE_CASTLE_TR    = new TileResource(4, 0);
  const TILE_CASTLE_BL    = new TileResource(3, 1);
  const TILE_CASTLE_BR    = new TileResource(4, 1);


  const InitialMap = [
    "TTTTTTt.......................",
    "TTTTTt........................",
    "TTTt..........................",
    "TTt...........................",
    "t.............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............cc..............",
    "..............cc..............",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "..............................",
    "...T..........................",
    "..TTt.........................",
    ".TTTTT........................",
  ];

  const MAP_SIZE  = new Vec2(InitialMap[0].length, InitialMap.length);

  const addTile = (layer, tile, x, y) => {
    const sprite = new Sprite(tile.frame);
    const tile_pos = new Vec2(x * TILE_SIZE + MAP_POS.x, y * TILE_SIZE + MAP_POS.y);

    sprite.position.set(tile_pos.x , tile_pos.y);

    layer.add(sprite);
  }

  const map_layer_base = scene.layer(0);
  const map_layer_top = scene.layer(1);

  const mud_tiles = [TILE_MUD_0, TILE_MUD_1, TILE_MUD_2];
  
  for (let y = 0; y < MAP_SIZE.y; y++) {
    for (let x = 0; x < MAP_SIZE.x; x++) {

      const c = InitialMap[y][x];

      let tile;

      if (c == '.')
      {
        tile = mud_tiles[Math.floor(Math.random() * mud_tiles.length)];
      }
      else if (c == 't')
      {
        tile = TILE_TREE_SMALL;
      }
      else if (c == 'T')
      {
        // If there's another tree below (or it's the bottom of the map), then it's a middle 
        if (y == MAP_SIZE.y - 1 || InitialMap[y + 1][x] == 'T')
        {
          tile = TILE_TREE_MIDDLE;

          // If there isn't another tree above, add a tree top there.
          if (y > 0 && InitialMap[y - 1][x] != 'T')
          {
            addTile(map_layer_top, TILE_TREE_TOP, x, y - 1);
          }
        }
        else
        {
          tile = TILE_TREE_BOTTOM;
        }
      }
      else if (c == 'c')
      {
        const isTop  = y < (MAP_SIZE.y - 1) && InitialMap[y + 1][x] == 'c';
        const isLeft = x < (MAP_SIZE.x - 1) && InitialMap[y][x + 1] == 'c';

        if (isTop)
          tile = isLeft ? TILE_CASTLE_TL : TILE_CASTLE_TR;
        else
          tile = isLeft ? TILE_CASTLE_BL : TILE_CASTLE_BR;
      }

      if (tile)
        addTile(map_layer_base, tile, x, y);
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