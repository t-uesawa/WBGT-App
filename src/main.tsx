import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// サービスワーカー
import { registerSW } from 'virtual:pwa-register';

// Reactアプリケーションのエントリーポイントとなる要素
const root = createRoot(document.getElementById('root') as Element);

// Appコンポーネントをroot要素にマウント(DOM内部へAppコンポーネントをレタリング)
root.render(
  // Strictモードとはその内部にあるコンポーネントの検査をしてくれる
  <StrictMode>
    <App />
  </StrictMode>
);

// サービスワーカーの登録
registerSW();