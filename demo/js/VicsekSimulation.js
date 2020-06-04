const nosSlider = document.getElementById("nos-range");
const nosOutput = document.getElementById("nos");
nosOutput.innerHTML = nosSlider.value;
nosSlider.oninput = function () { nosOutput.innerHTML = this.value; }

const velSlider = document.getElementById("vel-range");
const velOutput = document.getElementById("vel");
velOutput.innerHTML = velSlider.value;
velSlider.oninput = function () { velOutput.innerHTML = this.value; }


document.getElementById("c").onmousemove = function (event) { setMouseCoords(event) };
//==================Canvas=========================
const canvas = document.getElementById('c');

canvas.addEventListener("mousedown", doMouseDown, false);
canvas.addEventListener("mouseup", doMouseUp, false);
const gl = canvas.getContext('webgl2');

//==================Shaders========================
const vertexShaderSource = `#version 300 es
in vec2 a_position;
uniform vec2 u_resolution;	
void main() {
  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;
  gl_Position = vec4(clipSpace, 0, 1);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;     
void main() {
  outColor = u_color;
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  gl.deleteShader(shader);
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  gl.deleteProgram(program);
}

const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
const colorLocation = gl.getUniformLocation(program, "u_color");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  const positions = [
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
}

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);

const size = 2;
const type = gl.FLOAT;
const normalize = false;
const stride = 0;
const offset = 0;
gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

const L = 512;

function pause(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do { currentDate = Date.now(); }
  while (currentDate - date < milliseconds)
}

class Square {
  constructor(x, y) {
    this.v = parseFloat(velSlider.value);
    this.theta = 0.5;
    this.x = x;
    this.y = y;
  }
  newPos(theta) {
    this.theta = theta;
    this.x += this.v * Math.cos(this.theta);
    this.y += this.v * Math.sin(this.theta);
    this.x = (this.x + L) % L;
    this.y = (this.y + L) % L;
    setRectangle(gl, this.x, this.y, 6, 6);
    gl.uniform4f(colorLocation, 1, 1, 1, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

let squares = [];
const sqrN = 400;
for (let i = 0; i < sqrN; i++) {
  const xi = Math.floor(Math.random() * L);
  const yi = Math.floor(Math.random() * L);
  squares.push(new Square(xi, yi));
}

gl.useProgram(program);
gl.bindVertexArray(vao);

gl.clearColor(0.2, 0.2, 0.2, 0.9);

let isMousePressed = false;
let mouse_x;
let mouse_y;

function render() {
  gl.clearDepth(1.0);
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.viewport(0.0, 0.0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (const sqr_i of squares) {
    let nbrx_av = 0;
    let nbry_av = 0;
    for (const sqr_j of squares) {
      const sqr_ijx = sqr_i.x - sqr_j.x;
      const sqr_ijy = sqr_i.y - sqr_j.y;
      if ((sqr_ijx * sqr_ijx + sqr_ijy * sqr_ijy) < 25 * 25) {
        nbrx_av += Math.cos(sqr_j.theta);
        nbry_av += Math.sin(sqr_j.theta);
      }
    }
    sqr_i.v = parseFloat(velSlider.value);
    const nos = parseFloat(nosSlider.value);
    const newTheta = Math.atan2(nbry_av, nbrx_av);
    sqr_i.newPos((newTheta + nos * (2 * Math.random() - 1)) % (2 * Math.PI));
  }

  if (isMousePressed) {
    squares.shift();
    squares.push(new Square(mouse_x, mouse_y));
  }

  pause(1);
  requestAnimationFrame(render);
}
render();

function doMouseDown(event) {
  isMousePressed = true;
}

function doMouseUp() {
  isMousePressed = false;
}

function setMouseCoords(event) {
  const rect = canvas.getBoundingClientRect();
  mouse_x = event.clientX - rect.left;
  mouse_y = rect.bottom - event.clientY;
}

