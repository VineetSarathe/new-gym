import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import LeadPopup from "./components/LeadPopup";

function App() {
  return (
    <>
      <Navbar />

      <Home />

      <Contact />

      <Footer />

      <LeadPopup />
    </>
  );
}

export default App;