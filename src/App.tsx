import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import { client } from "@/config/thirdweb";
import CreateSurvey from "@/pages/CreateSurvey";
import Surveys from "@/pages/Surveys";
import SurveyDetail from "@/pages/SurveyDetail";
import Home from "@/pages/Home";
import NavBar from "@/components/NavBar";

export default function App() {
  return (
    <ThirdwebProvider client={client}>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateSurvey />} />
          <Route path="/surveys" element={<Surveys />} />
          <Route path="/survey/:id" element={<SurveyDetail />} />
        </Routes>
      </Router>
    </ThirdwebProvider>
  );
}
