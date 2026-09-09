import { Article, FindInPage, History, Logout, People, PostAdd } from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { grey, red } from "@mui/material/colors";
import { Fragment, useState, type JSX, type MouseEvent } from "react";
import logoAtrBpn from "/icons/logo-atr-bpn.png";
import LogoutDialog from "./LogoutDialog";
import { Link } from "react-router";
import { useAuth } from "../hooks/auth";
import { getUserFromToken } from "../lib/auth";

export const SIDEBAR_WIDTH = "17rem";

type SidebarMenu = {
  title: string;
  href: string;
  icon: JSX.Element;
  role: string[];
};

const sidebarMenus: SidebarMenu[] = [
  {
    title: "Permintaan Berkas",
    href: "/permintaan-berkas",
    icon: <FindInPage />,
    role: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Berkas",
    href: "/berkas",
    icon: <Article />,
    role: ["ADMIN", "SUPER_ADMIN"],
  },

  {
    title: "Peminjaman",
    href: "/peminjaman",
    icon: <PostAdd />,
    role: ["LOCKET"],
  },
  {
    title: "Riwayat Permintaan",
    href: "/riwayat-permintaan",
    icon: <History />,
    role: ["LOCKET", "ADMIN", "SUPER_ADMIN"],
  },
  {
    title: "Kelola Pengguna",
    href: "/users",
    icon: <People />,
    role: ["SUPER_ADMIN"],
  },
];

type SidebarContentProps = {
  onNavigate?: () => void;
  onShowLogoutDialog: (e: MouseEvent) => void;
};

const SidebarContent = ({ onNavigate, onShowLogoutDialog }: SidebarContentProps) => {
  const user = getUserFromToken();

  return (
    <Box role="presentation">
      <Box
        sx={{
          width: "full",
          height: 100,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            flexWrap: "nowrap",
            gap: "10px",
            paddingX: "8px",
          }}
        >
          <img width={50} src={logoAtrBpn} alt="logo ATR/BPN" />
          <h2
            style={{
              fontSize: "1rem",
              lineHeight: "1.2",
              textAlign: "start",
            }}
          >
            Kantor Pertanahan Kabupaten Pangandaran
          </h2>
        </Box>
      </Box>
      <Divider />
      <List>
        {sidebarMenus.map((menu) =>
          user && menu.role.includes(user.role!) ? (
            <ListItem key={menu.title} disablePadding>
              <ListItemButton
                sx={{
                  paddingX: "1.5rem",
                }}
                component={Link}
                to={menu.href}
                onClick={onNavigate}
              >
                <ListItemIcon>{menu.icon}</ListItemIcon>
                <ListItemText
                  sx={{
                    color: grey[800],
                  }}
                  primary={menu.title}
                />
              </ListItemButton>
            </ListItem>
          ) : null,
        )}
      </List>
      <Divider />
      <List>
        <ListItem key="logout" disableGutters>
          <ListItemButton
            sx={{
              paddingX: "1.5rem",
              ":hover": {
                backgroundColor: red[50],
              },
            }}
            onClick={onShowLogoutDialog}
          >
            <ListItemIcon>{<Logout color="error" />}</ListItemIcon>
            <ListItemText
              sx={{
                color: red[500],
              }}
              primary="Logout"
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

type SidebarProps = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const Sidebar = ({ mobileOpen, onCloseMobile }: SidebarProps) => {
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const auth = useAuth();

  const showDialogHandler = (e: MouseEvent) => {
    e.preventDefault();
    setShowDialog((prevState) => !prevState);
  };

  return (
    <Fragment>
      {/* Desktop: sidebar permanen, tampilan tidak berubah */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          minHeight: "100vh",
          borderRightWidth: 1,
          borderRightColor: grey[300],
          borderRightStyle: "solid",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: "white",
          display: { xs: "none", md: "block" },
        }}
      >
        <SidebarContent onShowLogoutDialog={showDialogHandler} />
      </Box>

      {/* Mobile/tablet: drawer sementara via hamburger */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <SidebarContent onNavigate={onCloseMobile} onShowLogoutDialog={showDialogHandler} />
      </Drawer>

      <LogoutDialog showDialog={showDialog} showDialogHandler={showDialogHandler} auth={auth} />
    </Fragment>
  );
};

export default Sidebar;
