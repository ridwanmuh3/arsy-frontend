import { Fragment } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Topbar from "./Topbar";

const Layout = () => {
  return (
    <Fragment>
      <Sidebar />
      <Topbar />
      <main>
        <Outlet />
      </main>
    </Fragment>
  );
};

export default Layout;
