import Renderer from './renderer.js';
import { TILE_SIZE, MAP_POS, scene, addTile, Vec2, SCALE, } from './utils.js';
import { getActors, resetActors, addPeon } from './actor.js';

const { Point, Sprite } = Renderer;

const stats = new Stats();
document.body.appendChild(stats.dom);

const view = document.getElementById('view');

const { gl } = scene;
console.log(gl);

scene.background(0.3, 0.3, 1, 0);

scene.camera.at.set(0, 0);
scene.camera.to.set(0);

let tileAtlasImage = new Image();
tileAtlasImage.src = "src/atlas.png";

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

    const MAP_SIZE = new Vec2(InitialMap[0].length, InitialMap.length);

    const map_layer_base = scene.layer(0);
    const map_layer_top = scene.layer(1);

    const mud_tiles = [TILE_MUD_0, TILE_MUD_1, TILE_MUD_2];

    for (let y = 0; y < MAP_SIZE.y; y++) {
        for (let x = 0; x < MAP_SIZE.x; x++) {

            const c = InitialMap[y][x];

            let tile;

            if (c == '.') {
                tile = mud_tiles[Math.floor(Math.random() * mud_tiles.length)];
            }
            else if (c == 't') {
                tile = TILE_TREE_SMALL;
            }
            else if (c == 'T') {
                // If there's another tree below (or it's the bottom of the map), then it's a middle
                if (y == MAP_SIZE.y - 1 || InitialMap[y + 1][x] == 'T') {
                    tile = TILE_TREE_MIDDLE;

                    // If there isn't another tree above, add a tree top there.
                    if (y > 0 && InitialMap[y - 1][x] != 'T') {
                        const pos_x = x * TILE_SIZE + MAP_POS.x;
                        const pos_y = y * TILE_SIZE + MAP_POS.y - 1;
                        addTile(map_layer_top, TILE_TREE_TOP, pos_x, pos_y);
                    }
                }
                else {
                    tile = TILE_TREE_BOTTOM;
                }
            }
            else if (c == 'c') {
                const isTop = y < (MAP_SIZE.y - 1) && InitialMap[y + 1][x] == 'c';
                const isLeft = x < (MAP_SIZE.x - 1) && InitialMap[y][x + 1] == 'c';

                if (isTop)
                    tile = isLeft ? TILE_CASTLE_TL : TILE_CASTLE_TR;
                else
                    tile = isLeft ? TILE_CASTLE_BL : TILE_CASTLE_BR;
            }

            if (tile) {
                const pos_x = x * TILE_SIZE + MAP_POS.x;
                const pos_y = y * TILE_SIZE + MAP_POS.y;
                addTile(map_layer_base, tile, pos_x, pos_y);
            }
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

    view.onclick = (e) => {
        const actorsList = getActors();
        var rect = view.getBoundingClientRect();
        const mousePos = {
            x: (e.clientX - rect.left) / SCALE - TILE_SIZE / 2,
            y: (e.clientY - rect.top) / SCALE - TILE_SIZE / 2
        };

        // check if click on actor
        for (const actor of actorsList) {
            if (mousePos.x >= actor.pos.x && mousePos.x < actor.pos.x + actor.size.w &&
                mousePos.y >= actor.pos.y && mousePos.y < actor.pos.y + actor.size.h) {
                actor.selected(!actor.isSelected);
            } else if (actor.isSelected) {
                actor.moveTo(mousePos.x, mousePos.y);
            }
        }
    };

    document.onkeydown = (e) => {
        switch (e.key) {
            case 'r':
                const actorsList = getActors();
                const peon = actorsList[0];
                peon.sprite.remove();
                resetActors();
                break;
            case 'p':
                addPeon(96, 96);
            default:
                break;
        }
    };

    let start;
    let previous = 0;
    const gameLoop = (timeStamp) => {
        if (start === undefined) {
            start = timeStamp;
        }
        const elapsed = timeStamp - start;
        stats.begin();

        for (const actor of getActors()) {
            actor.update((timeStamp - previous) / 1000);
        }

        previous = timeStamp;

        scene.render();
        stats.end();

        requestAnimationFrame(gameLoop);
    };

    requestAnimationFrame(gameLoop);
}

tileAtlasImage.onload = gameStart;
