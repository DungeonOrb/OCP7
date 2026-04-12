import { useRouter } from "next/router";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const hideLayout =
    router.pathname === "/connexion" || router.pathname === "/inscription";

  return (
    <>
      {!hideLayout && <Header />}
      <Component {...pageProps} />
      {!hideLayout && <Footer />}
    </>
  );
}