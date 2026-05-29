import type React from "react";
import "../App.css";
import CalendarIndex from "./calendar/Index";
import Layout from "./layout";

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="h-screen flex justify-start w-[100%] overflow-hidden">
        <CalendarIndex />
      </div>
    </Layout>
  );
};

export default Index;
