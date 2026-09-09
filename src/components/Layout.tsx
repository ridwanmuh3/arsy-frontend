import { Fragment, useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router";
import Topbar from "./Topbar";

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Fragment>
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
      <main>
        <Outlet />
      </main>
    </Fragment>
  );
};

export default Layout;
