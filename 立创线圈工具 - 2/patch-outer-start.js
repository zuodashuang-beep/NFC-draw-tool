const fs = require("fs");
const path = "d:/Logic/立创线圈工具/index.html";
let html = fs.readFileSync(path, "utf8");
const start = html.indexOf("function buildRectSpiral");
const end = html.indexOf("function maxTurns");
if (start < 0 || end < 0) throw new Error("markers not found");

const neu = `function buildRectSpiral({ W, H, w, gap, turns, chamfer, dir, startX, startY }) {
      const pitch = w + gap;
      const pts = [];
      function add(x, y) {
        if (!pts.length || Math.hypot(x - pts.at(-1)[0], y - pts.at(-1)[1]) > 1e-9) pts.push([x, y]);
      }
      function ch(seg) {
        if (!(chamfer > 0)) return 0;
        return Math.min(chamfer, seg * 0.49);
      }
      // 0=bottom 1=right 2=top 3=left
      function sideOf(p, L, R, B, T) {
        const db = Math.abs(p.y - B), dr = Math.abs(p.x - R), dt = Math.abs(p.y - T), dl = Math.abs(p.x - L);
        const m = Math.min(db, dr, dt, dl);
        if (m === db) return 0;
        if (m === dr) return 1;
        if (m === dt) return 2;
        return 3;
      }

      let L = w / 2, R = W - w / 2, B = w / 2, T = H - w / 2;
      const snap = projectToOuterCenterline(startX, startY, W, H, w);
      let side = sideOf(snap, L, R, B, T);
      add(snap.x, snap.y);

      for (let turn = 0; turn < turns; turn++) {
        const ww = R - L, hh = T - B;
        if (ww < pitch * 0.9 || hh < pitch * 0.9) break;
        const cx = ch(ww), cy = ch(hh);
        const more = turn < turns - 1;
        const cwOrder = [0, 1, 2, 3];
        const ccwOrder = [0, 3, 2, 1];
        const order = dir === "cw" ? cwOrder : ccwOrder;
        let startIdx = order.indexOf(side);
        if (startIdx < 0) startIdx = 0;

        for (let k = 0; k < 4; k++) {
          const sid = order[(startIdx + k) % 4];
          const isLast = k === 3;

          if (dir === "cw") {
            if (sid === 0) {
              add(R - cx, B);
              add(R, B + cy);
            } else if (sid === 1) {
              add(R, T - cy);
              add(R - cx, T);
            } else if (sid === 2) {
              add(L + cx, T);
              add(L, T - cy);
            } else if (sid === 3) {
              if (more && isLast) {
                const nextB = B + pitch;
                add(L, nextB + cy);
                L += pitch; R -= pitch; B = nextB; T -= pitch;
                add(L, B);
                side = 0;
              } else if (!more && isLast) {
                add(L, (B + T) / 2);
              } else {
                add(L, B + cy);
                add(L + cx, B);
              }
            }
          } else {
            if (sid === 0) {
              add(L + cx, B);
              add(L, B + cy);
            } else if (sid === 3) {
              add(L, T - cy);
              add(L + cx, T);
            } else if (sid === 2) {
              add(R - cx, T);
              add(R, T - cy);
            } else if (sid === 1) {
              if (more && isLast) {
                const nextB = B + pitch;
                add(R, nextB + cy);
                L += pitch; R -= pitch; B = nextB; T -= pitch;
                add(R, B);
                side = 0;
              } else if (!more && isLast) {
                add(R, (B + T) / 2);
              } else {
                add(R, B + cy);
                add(R - cx, B);
              }
            }
          }
        }

        // 第二圈起固定从当前环的“前进方向起点”继续
        if (more && turn >= 0) {
          // side 已在 inset 时设置
        } else {
          break;
        }
      }

      return { pts, snap };
    }

`;

html = html.slice(0, start) + neu + html.slice(end);
fs.writeFileSync(path, html);
console.log("patched ok");
