import type { Metadata } from "next";
import Navbar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";


export const metadata: Metadata = {
  title: "Meu App",
  description: "Descrição do app",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
