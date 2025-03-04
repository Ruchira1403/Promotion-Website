import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import Aboutus from "./components/Pages/Aboutus";
import ProductsDetails from "./components/Pages/ProductsDetails";
import Gallery from "./components/Pages/Gallery";
import ContactUs from "./components/Pages/ContactUs";
import Careers from "./components/Pages/Careers";
import Banner from "./components/Banner";
import AboutUs from "./components/AboutUs";
import Products from "./components/Products";
import OurValues from "./components/OurValues";
import VisionMissionObjectives from "./components/Pages/VisionMissionObjectives";
import Login from "./components/Pages/Login";
import SignUp from "./components/Pages/SignUp";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

// Define the Home component
const Home = () => (
  <>
    <Banner />
    <AboutUs />
    <Products />
    <OurValues />
  </>
);

// Define NotFound component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-gray-600">Page not found</p>
    </div>
  </div>
);

// Define routes
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "aboutus",
          element: (
            <>
              <Aboutus />
              <VisionMissionObjectives />
            </>
          ),
        },
        {
          path: "products",
          element: <ProductsDetails />,
        },
        {
          path: "gallery",
          element: <Gallery />,
        },
        {
          path: "contactus",
          element: <ContactUs />,
        },
        {
          path: "careers",
          element: <Careers />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "signup",
          element: <SignUp />,
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <div>Profile Page</div>
            </ProtectedRoute>
          ),
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
