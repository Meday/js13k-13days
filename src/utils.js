import Renderer from './renderer.js';

const { Point, Sprite } = Renderer;

export class Vec2 extends Point {
    add(vec) {
        return new Vec2(vec.x + this.x, vec.y + this.y);
    }
}

export const TILE_SIZE = 8;
export const MAP_POS = new Vec2(8, 8);
export const SCALE = 3;

export const scene = Renderer(view, { scale: 1.0 / SCALE });

export const addTile = (layer, tile, x, y) => {
    const sprite = new Sprite(tile.frame);
    const tile_pos = new Vec2(x, y);

    sprite.position.set(tile_pos.x, tile_pos.y);

    layer.add(sprite);

    return sprite;
}

class Tile {
    constructor(texture, tileX, tileY) {
        this.frame = texture.frame(new Point(tileX * TILE_SIZE, tileY * TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE));
    }
}
const textures = [];
export const getTile = (src, sx, sy) =>
    new Promise(resolve => {
        if (textures[src]) {
            const tile = new Tile(textures[src], sx, sy);
            resolve(tile);
            return;
        } else {
            const image = new Image;
            image.onerror = image.onload = () => {
                const texture = scene.texture(image, 1);
                textures[src] = texture;
                const tile = new Tile(texture, sx, sy);
                resolve(tile);
            }
            image.src = src;
        }
    });


