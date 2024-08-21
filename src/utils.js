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

const textures = [];
export async function loadTexture(src) {
    return await new Promise(resolve => {
        if (textures[src]) {
            resolve(textures[src]);
            return;
        } else {
            const image = new Image;
            image.onerror = image.onload = () => {
                const texture = scene.texture(image, 1);
                textures[src] = texture;
                resolve(texture);
            }
            image.src = src;
        }
    });
}

const atlasTexture = await loadTexture("src/atlas.png");

export class TileResource {
    constructor(tileX, tileY) {
        this.frame = atlasTexture.frame(new Point(tileX * TILE_SIZE, tileY * TILE_SIZE), new Point(TILE_SIZE, TILE_SIZE));
    }
}

export class AnimResource {
    constructor(origin, size, numFrames, options) {
        if (options == null)
            options = {};

        this.flipX = options.flipX || false;
        this.flipY = options.flipY || false;

        this.frames = Array(numFrames);

        for (let f = 0; f < numFrames; f++) {
            let frame = atlasTexture.frame(origin, size);
            this.frames[f] = frame;

            // Frames are next to each other horizontally
            origin.x += size.x;

            if (this.flipX) {
                frame.uvs[0] = frame.uvs[0] + frame.uvs[2];
                frame.uvs[2] = -frame.uvs[2];
            }

            if (this.flipY) {
                frame.uvs[1] = frame.uvs[1] + frame.uvs[3];
                frame.uvs[3] = -frame.uvs[3];
            }
        }

        // All frames are 100ms by default
        this.frameDurations = Array(numFrames);
        this.frameDurations.fill(options.frameDuration || 0.1)

        this.loop = options.loop || true;
        this.numFrames = numFrames;
    }
}

export class Anim {
    constructor(resource, sprite) {
        this.resource = resource;
        this.currFrame = 0;
        this.currTime = 0;
        this.sprite = sprite;
        this.sprite.frame = this.resource.frames[0];
    }

    nextFrame() {
        if (this.currFrame < this.resource.numFrames - 1)
            this.currFrame++;
        else if (this.resource.loop)
            this.currFrame = 0;

        this.sprite.frame = this.resource.frames[this.currFrame];
    }

    update(deltaTime) {
        this.currTime += deltaTime;

        while (this.currTime > this.resource.frameDurations[this.currFrame])
        {
            this.currTime -= this.resource.frameDurations[this.currFrame];
            this.nextFrame();
        }
    }
}


