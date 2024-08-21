import { TILE_SIZE, addTile, scene, AnimResource, Anim, Vec2 } from "./utils";
import Renderer from './renderer.js';

const { Point, Sprite } = Renderer;

const STATE_IDLE = 'idle';
const STATE_MOVING = 'moving';

const FACE_UP = 'up';
const FACE_DOWN = 'down';
const FACE_LEFT = 'left';
const FACE_RIGHT = 'right';

let actorsList = [];

export const getActors = () => actorsList;
export const resetActors = () => actorsList = [];

export class Actor {
    constructor(x, y, anims) {
        this.direction = FACE_DOWN;
        this.sprite = null;
        this.state = null;
        this.speed = 10;
        this.isSelected = false;
        this.anims = anims;
    }
    
    get size() {
        return this.sprite.frame.size;
    }

    get pos() {
        return this.sprite.position;
    }

    selected(value = true) {
        this.isSelected = value;
        if (this.sprite) {
            this.sprite.tint = value ? 0x00FF00 : 0xFFFFFF;
        }
    }

    update(deltatime) {
        // Do nothing
    }

    
    getAnimResource() {

        // Idle doesn't have directions
        if (this.state == STATE_IDLE)
            return this.anims[STATE_IDLE];

        // If this state doesn't have anims, fall back to idle
        const state_anims = this.anims[this.state];
        if (state_anims == null)
            return this.anims[STATE_IDLE];

        // If this direction doesn't have anims, fall back to idle
        const anim = state_anims[this.direction];
        if (anim == null)
            return this.anims[STATE_IDLE];

        return anim;
    }

    setState(new_state) {
        if (this.state == new_state)
            return;

        this.state = new_state;
        this.currAnim = new Anim(this.getAnimResource(), this.sprite);
    }

    setDirection(new_dir) {
        if (this.direction == new_dir)
            return;

        this.direction = new_dir;
        this.currAnim = new Anim(this.getAnimResource(), this.sprite);
    }
}


let spriteY = 32;
const VILLAGER_IDLE     = new AnimResource(new Vec2(0, spriteY), new Vec2(9), 8); spriteY += 9;
const VILLAGER_LEFT     = new AnimResource(new Vec2(0, spriteY), new Vec2(9), 8); spriteY += 9;
const VILLAGER_UP       = new AnimResource(new Vec2(0, spriteY), new Vec2(9), 8); spriteY += 9;
const VILLAGER_DOWN     = new AnimResource(new Vec2(0, spriteY), new Vec2(9), 8); spriteY += 9;
const VILLAGER_HIT      = new AnimResource(new Vec2(0, spriteY), new Vec2(9), 8); spriteY += 9;
const VILLAGER_DIE      = new AnimResource(new Vec2(0, spriteY), new Vec2(9), 4, { loop : false });

export class Peon extends Actor {
    constructor(x, y) {
        let move_anims = [];
        move_anims[FACE_UP   ] = VILLAGER_UP;
        move_anims[FACE_DOWN ] = VILLAGER_DOWN;
        move_anims[FACE_LEFT ] = VILLAGER_LEFT;
        move_anims[FACE_RIGHT] = VILLAGER_LEFT;

        let anims = [];
        anims[STATE_IDLE] = VILLAGER_IDLE;
        anims[STATE_MOVING] = move_anims;

        super(x, y, anims);

        this.sprite = new Sprite(this.anims[STATE_IDLE].frames[0]);
        this.sprite.position.set(x, y);

        this.setState(STATE_IDLE);
        this.target = { x, y };

        scene.layer(2).add(this.sprite);
    }

    moveTo(x, y) {
        this.target.x = x;
        this.target.y = y;
        this.setState(STATE_MOVING);
        this.update(0); // To make sure direction is updated.
    }

    update(deltaTime) {
        if (this.currAnim)
            this.currAnim.update(deltaTime);

        if (this.state === STATE_MOVING) {
            // Move towards target
            let dx = this.target.x - this.pos.x;
            let dy = this.target.y - this.pos.y;

            // Calculate direction
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    this.setDirection(FACE_RIGHT);
                } else {
                    this.setDirection(FACE_LEFT);
                }
            } else {
                if (dy > 0) {
                    this.setDirection(FACE_DOWN);
                } else {
                    this.setDirection(FACE_UP);
                }
            }
            console.log(this.direction);
            
            // Calculate distance
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 1) {
                this.pos.x = this.target.x;
                this.pos.y = this.target.y;
                this.setState(STATE_IDLE);
                this.sprite.position.set(this.pos.x, this.pos.y);
            } else {
                this.pos.x += dx / dist * this.speed * deltaTime;
                this.pos.y += dy / dist * this.speed * deltaTime;
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
