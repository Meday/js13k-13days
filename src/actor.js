import { TILE_SIZE, getTile, addTile, scene } from "./utils";
import Renderer from './renderer.js';

const { Point, Sprite } = Renderer;

const STATUS_IDLE = 'idle';
const STATUS_MOVING = 'moving';

const FACE_UP = 'up';
const FACE_DOWN = 'down';
const FACE_LEFT = 'left';
const FACE_RIGHT = 'right';

let actorsList = [];

export const getActors = () => actorsList;
export const resetActors = () => actorsList = [];

export class Actor {
    constructor(x, y, img) {
        this.pos = { x: x, y: y };
        this.size = { w: TILE_SIZE, h: TILE_SIZE };
        this.direction = FACE_DOWN;
        this.img = img;
        this.sprite = null;
        this.status = null;
        this.isSelected = false;
    }

    selected(value = true) {
        this.isSelected = value;
        if (this.sprite) {
            this.sprite.tint = value ? 0x00FF00 : 0xFFFFFF;
        }
    }

    update() {
        // Do nothing
    }
}

export class Peon extends Actor {
    constructor(x, y) {
        super(x, y, 'src/Sprites/GoldMine.png');
        this.status = STATUS_IDLE;
        this.target = { x, y };

        getTile(this.img, 0, 0).then((tile) => {
            this.sprite = addTile(scene.layer(2), tile, x, y);
        });
    }

    moveTo(x, y) {
        this.target.x = x;
        this.target.y = y;
        this.status = STATUS_MOVING;
    }

    update() {
        if (this.status === STATUS_MOVING) {
            // Move towards target
            let dx = this.target.x - this.pos.x;
            let dy = this.target.y - this.pos.y;

            // Calculate direction
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    console.log(FACE_RIGHT);
                } else {
                    console.log(FACE_LEFT);
                }
            } else {
                if (dy > 0) {
                    console.log(FACE_DOWN);
                } else {
                    console.log(FACE_UP);
                }
            }

            // Calulate distance
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 1) {
                this.pos.x = this.target.x;
                this.pos.y = this.target.y;
                this.status = STATUS_IDLE;
                this.sprite.position.set(this.pos.x, this.pos.y);
            } else {
                this.pos.x += dx / dist;
                this.pos.y += dy / dist;
                this.sprite.position.set(this.pos.x, this.pos.y);
            }
        }
    }
}

export function addPeon(x, y) {
    let actor = new Peon(x, y);
    actorsList.push(actor);
    return actor;
}
