import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), VitePWA({
    // 自動更新タイプを設定 (autoUpdate, promptなど)
    registerType: 'autoUpdate',

    // PWAのマニフェスト設定
    manifest: {
      id: '/WBGT-App/',
      // ユーザーに通常表示されるアプリ名
      name: 'WBGT App',
      // name を表示するのに十分なスペースがない場合に表示されるアプリ名
      short_name: 'WBGT',
      // アプリの詳細な説明
      description: 'WBGT(暑さ指数計測記録アプリ)',
      /**
       * アプリの開始 URL:
       * 通常はサーブするディレクトリそのもの
       */
      start_url: '.',
      /**
       * 表示モード:
       * fullscreen: フルスクリーン
       * standalone: 単独のアプリのようになる
       * minimal-ui: 最小限のブラウザ UI は残る
       * browser: 通常のブラウザ
       */
      display: "standalone",
      /**
       * アプリの向き:
       * portrait: 縦向き
       * landscape: 横向き
       * any: 向きを強制しない
       */
      orientation: "portrait",
      // 既定のテーマカラー
      theme_color: '#3f51b2',
      // スタイルシートが読み込まれる前に表示するアプリページの背景色
      background_color: "#efeff4",
      /**
       * favicon やアプリアイコンの配列:
       * 最低でも 192x192ビクセルと512x512ビクセルの 2 つのアプリアイコンが必要
       */
      icons: [
        {
          src: 'icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'icon-512x512-mask.png',
          sizes: '512x512',
          type: 'image/png',
          // 用途をマスカブルアイコンとする
          purpose: 'maskable',
        },
      ],
    },

    // Workboxによるキャッシュ戦略の設定
    workbox: {
      // ランタイムキャッシングの設定
      runtimeCaching: [
        {
          // キャッシュ対象のURLパターン (同じオリジンのリソース)
          urlPattern: ({ url }) => url.origin === self.location.origin,
          // キャッシュ戦略 (CacheFirst: まずキャッシュを確認)
          handler: 'CacheFirst',
          options: {
            // キャッシュ名
            cacheName: 'static-resources',
            // キャッシュの有効期限設定
            expiration: {
              // 最大エントリー数
              maxEntries: 50,
              // キャッシュの有効期間 (30日)
              maxAgeSeconds: 30 * 24 * 60 * 60,
            },
          },
        },
        {
          // キャッシュ対象のURLパターン (異なるオリジンのリソース)
          urlPattern: ({ url }) => url.origin !== self.location.origin,
          // キャッシュ戦略 (NetworkFirst: まずネットワークを確認)
          handler: 'NetworkFirst',
          options: {
            // キャッシュ名
            cacheName: 'external-resources',
            // ネットワークタイムアウト時間 (秒)
            networkTimeoutSeconds: 10,
            // キャッシュの有効期限設定
            expiration: {
              // 最大エントリー数
              maxEntries: 50,
              // キャッシュの有効期間 (7日)
              maxAgeSeconds: 7 * 24 * 60 * 60,
            },
            // キャッシュ可能なレスポンスのステータスコード
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    }
  })],
});