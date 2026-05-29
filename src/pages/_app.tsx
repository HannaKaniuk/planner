import type { AppProps } from "next/app";
import { useEffect } from "react";
import "../App.css";
import "../index.css";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  return <Component {...pageProps} />;
}
