# 家計簿 (kakeibo-app)

iPhone 用の個人向け家計簿 PWA。React + TypeScript + Vite + Dexie(IndexedDB)。サーバー不要・完全オフライン動作。

```
npm install
npm run dev        # 開発（http://<PCのIP>:5173 をiPhoneで開ける）
npm run build      # dist/ に本番ビルド（PWA/Service Worker 生成）
npm run preview    # ビルド結果の確認（http://<PCのIP>:4173）
npm run icons      # アイコン再生成
```

構成: `src/db`（保存層・差し替え可能な Repository）/ `hooks` / `components` / `pages` / `utils`

注意: Service Worker とホーム画面追加は HTTPS（または localhost）でのみ有効です。
iPhoneで常用するには `dist/` を HTTPS で配信できる場所（GitHub Pages / Cloudflare Pages / Netlify などの無料枠）に置いてください。
