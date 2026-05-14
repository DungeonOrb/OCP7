import { useRouter } from "next/router";
import Head from "next/head";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPageTitle } from "../utils/pageTitles";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  const hideLayout =
    router.pathname === "/connexion" || router.pathname === "/inscription";

  const title = getPageTitle(router.pathname);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content="Abricot, application de gestion de projets et de tâches."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {!hideLayout && <Header />}

      <main id="main-content">
        <Component {...pageProps} />
      </main>

      {!hideLayout && <Footer />}
    </>
  );
}