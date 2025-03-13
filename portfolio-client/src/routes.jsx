import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import ProtectedLayout from "./components/ProtectedLayout";
import { UserContext } from "./contexts/UserContext";

import Login from "./pages/Login/Login";
import FirstLoginPage from "./pages/FirstLoginPage/FirstLoginPage";
import Home from "./pages/Home/Home";
import Student from "./pages/Student/Student";
import ChekProfile from "./pages/ChekProfile/ChekProfile";
import Recruiter from "./pages/Recruiter/Recruiter";
import Staff from "./pages/Staff/Staff";
import CompanyProfile from "./pages/Profile/CompanyProfile/CompanyProfile";
import StudentProfile from "./pages/Profile/StudentProfile/StudentProfile";
import Top from "./pages/Profile/Top/Top";
import QA from "./pages/Profile/QA/QA";
import Stats from "./pages/Profile/Stats/Stats";
import CreditDetails from "./pages/CreditDetails/CreditDetails";
import Setting from "./pages/Setting/Setting";
import FAQ from "./pages/FAQ/FAQ";
import NotFound from "./pages/NotFound/NotFound";
import Unauthorized from "./pages/Unauthorized/Unauthorized";
import LogOut from "./components/LogOut";

const AppRoutes = () => {
  const { role, userId, updateUser, language } = useContext(UserContext);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<ProtectedLayout />}>
            <Route index element={role === "Student" ? <Navigate to={`/profile`} /> : <Home />} />
            <Route
              path="/student"
              element={<ProtectedLayout allowedRoles={["Admin", "Staff", "Recruiter"]} />}
            >
              <Route index element={<Student key="students" />} />
              <Route path="profile/:studentId/*" element={<StudentProfile />}>
                <Route index element={<Navigate to="top" />} />{" "}
                {/* Redirect index to top */}
                <Route path="top" element={<Top />} />
                <Route path="stats" element={<Stats />} />
              </Route>
            </Route>

            <Route
              path="/checkprofile"
              element={<ProtectedLayout allowedRoles={["Admin", "Staff"]} />}
            >
              <Route index element={<ChekProfile key="checkprofile" />} />
              <Route path="profile/:studentId/*" element={<StudentProfile />}>
                <Route index element={<Navigate to="top" />} />{" "}
                {/* Redirect index to top */}
                <Route path="top" element={<Top />} />
                <Route path="stats" element={<Stats />} />
              </Route>
            </Route>

            <Route
              path="/recruiter"
              element={<ProtectedLayout allowedRoles={["Admin", "Staff", "Student"]} />}
            >
              <Route index element={<Recruiter />} />
            </Route>

            <Route
              path="/companyprofile"
              element={<ProtectedLayout allowedRoles={["Admin", "Staff", "Recruiter", "Student"]} />}
            >
              <Route index element={<CompanyProfile userId={role === "Recruiter" ? userId : 0} />} />
            </Route>

            <Route path="/profile" element={<ProtectedLayout allowedRoles={["Student"]} />}>
              <Route path="*" element={<StudentProfile userId={userId} />}>
                <Route index element={<Navigate to="top" state={{ userId: userId }} />} />{" "}
                {/* Redirect index to top */}
                <Route path="top" element={<Top />} />
                <Route path="stats" element={<Stats />} />
              </Route>
            </Route>

            <Route path="/staff" element={<ProtectedLayout allowedRoles={["Admin"]} />}>
              <Route index element={<Staff />} />
            </Route>

            <Route path="/student-qa" element={<ProtectedLayout allowedRoles={["Admin"]} />}>
              <Route index element={<QA />} />
            </Route>

            <Route path="/bookmarked" element={<ProtectedLayout allowedRoles={["Recruiter"]} />}>
              <Route index element={<Student key="bookmarked" OnlyBookmarked={true} />} />
              <Route path="profile/:studentId/*" element={<StudentProfile />}>
                <Route index element={<Navigate to="top" />} />{" "}
                {/* Redirect index to top */}
                <Route path="top" element={<Top />} />
                <Route path="stats" element={<Stats />} />
              </Route>
            </Route>

            <Route path="/settings" element={<Setting />} />
            <Route path="/help" element={<FAQ />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>
        <Route path="/credit-details" element={<CreditDetails />} />
        <Route path="*" element={<NotFound lang={language} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<LogOut updateUser={updateUser} />} />
        <Route path="/FirstloginPage" element={<FirstLoginPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
