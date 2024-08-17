import Renderer from './renderer.js';

const { Point, Sprite } = Renderer;

const stats = new Stats();
document.body.appendChild(stats.dom);

const view = document.getElementById('view');
// const scene = Renderer(view, { alpha: true });
const scene = Renderer(view);
const { gl } = scene;
console.log(gl);

scene.background(1, 1, 1, 0);

scene.camera.at.set(400, 300);
scene.camera.to.set(0.5);

let tileAtlasImage = new Image();
tileAtlasImage.src="src/Sprites/GoldMine.png";

const gameStart = () => {

  const tileAtlasTexture = scene.texture(tileAtlasImage, 1);
  // tileAtlasTexture.anchor = new Point(0.5);

  const frame = tileAtlasTexture.frame(new Point(), new Point(16, 16));
  const layer = scene.layer(0);
  const sprite = new Sprite(frame);

  sprite.position.set(200, 200);
  sprite.scale.set(4, 4);
  // sprite.a = 0.5;

  layer.add(sprite)

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

    // scene.camera.angle += 0.005;

    scene.render();
    stats.end();

    requestAnimationFrame(gameLoop);
  };

  gameLoop();
}

tileAtlasImage.onload = gameStart;