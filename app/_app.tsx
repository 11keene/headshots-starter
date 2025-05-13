// File: pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* ─── 1) Define the init callback FIRST ─────────────────────────── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,es,fr,de,pt,zh-CN,ja,ru,ar,hi',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                }, 'google_translate_element');
              }
            `,
          }}
          key="gt-init"
        />

        {/* ─── 2) Then load Google’s translator library ──────────────────── */}
        <script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          defer
          key="gt-lib"
        />
      </Head>

      <Component {...pageProps} />
    </>
  );
}
