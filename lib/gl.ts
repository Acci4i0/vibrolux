/* Small WebGL2 helpers shared by the shader sections (EdgeCarousel, Horizon). */

/** one triangle that covers the canvas */
export const FULLSCREEN_VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/** compiles and links the fullscreen vertex shader with `frag`; null if the GPU refuses */
export function glProgram(gl: WebGL2RenderingContext, frag: string) {
  const sh = (type: number, src: string) => {
    const x = gl.createShader(type)!;
    gl.shaderSource(x, src);
    gl.compileShader(x);
    if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(x));
    return x;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, FULLSCREEN_VERT));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}

/** binds the fullscreen triangle to attribute 0; returns the buffer to delete on cleanup */
export function fullscreenTriangle(gl: WebGL2RenderingContext) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  return buf;
}

/** a palette token ('--color-brand') as [r, g, b] in 0…1, or `fallback` */
export function tokenRgb(name: string, fallback: number[]) {
  const m = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
    .match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return m ? m.slice(1).map((h) => parseInt(h, 16) / 255) : fallback;
}
