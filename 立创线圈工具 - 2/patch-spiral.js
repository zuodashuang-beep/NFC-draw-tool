const fs = require("fs");
const path = "d:/Logic/立创线圈工具/index.html";
let html = fs.readFileSync(path, "utf8");
const start = html.indexOf("function buildRectSpiral");
const end = html.indexOf("/** Max turns that fit");
if (start < 0 || end < 0) {
  console.error("markers not found", start, end);
  process.exit(1);
}

const neu = `function buildRectSpiral({ W, H, w, gap, turns, chamfer, dir }) {
      const pitch = w + gap;
      const pts = [];
      let L = w / 2;
      let R = W - w / 2;
      let B = w / 2;
      let T = H - w / 2;

      function add(x, y) {
        if (!pts.length || Math.hypot(x - pts.at(-1)[0], y - pts.at(-1)[1]) > 1e-9) pts.push([x, y]);
      }
      function ch(seg) {
        if (!(chamfer > 0)) return 0;
        return Math.min(chamfer, seg * 0.49);
      }

      if (dir === "cw") {
        add(L, B);
        for (let i = 0; i < turns; i++) {
          const ww = R - L, hh = T - B;
          if (ww < pitch * 0.9 || hh < pitch * 0.9) break;
          const cx = ch(ww), cy = ch(hh);

          add(R - cx, B);
          add(R, B + cy);
          add(R, T - cy);
          add(R - cx, T);
          add(L + cx, T);
          add(L, T - cy);

          const nextB = B + pitch;
          const nextL = L + pitch;
          const nextR = R - pitch;
          const nextT = T - pitch;
          if (i < turns - 1) {
            add(L, nextB + cy);
            add(nextL, nextB);
            L = nextL; R = nextR; B = nextB; T = nextT;
          } else {
            const endY = (nextB + Math.max(nextT, nextB)) / 2;
            add(L, Math.max(nextB, Math.min(T - cy, endY)));
          }
        }
      } else {
        add(R, B);
        for (let i = 0; i < turns; i++) {
          const ww = R - L, hh = T - B;
          if (ww < pitch * 0.9 || hh < pitch * 0.9) break;
          const cx = ch(ww), cy = ch(hh);
          add(L + cx, B);
          add(L, B + cy);
          add(L, T - cy);
          add(L + cx, T);
          add(R - cx, T);
          add(R, T - cy);
          const nextB = B + pitch;
          const nextL = L + pitch;
          const nextR = R - pitch;
          const nextT = T - pitch;
          if (i < turns - 1) {
            add(R, nextB + cy);
            add(nextR, nextB);
            L = nextL; R = nextR; B = nextB; T = nextT;
          } else {
            const endY = (nextB + Math.max(nextT, nextB)) / 2;
            add(R, Math.max(nextB, Math.min(T - cy, endY)));
          }
        }
      }
      return pts;
    }

`;

html = html.slice(0, start) + neu + html.slice(end);
fs.writeFileSync(path, html);
console.log("ok");
