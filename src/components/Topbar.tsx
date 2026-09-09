import { Box, IconButton } from "@mui/material";
import { Fragment } from "react";
import { grey } from "@mui/material/colors";
import { AccountCircleRounded, Menu } from "@mui/icons-material";
import { getUserFromToken } from "../lib/auth";
import { SIDEBAR_WIDTH } from "./Sidebar";

type TopbarProps = {
  onOpenMobileNav: () => void;
};

const Topbar = ({ onOpenMobileNav }: TopbarProps) => {
  const user = getUserFromToken();
  return (
    <Fragment>
      <Box
        sx={{
          paddingLeft: { xs: 0, md: SIDEBAR_WIDTH },
          borderBottom: 1,
          borderBottomColor: grey[300],
          position: "sticky",
          top: 0,
          zIndex: 90,
          backgroundColor: "white",
        }}
      >
        <Box
          sx={{
            width: "100%",
            minHeight: "4.4rem",
            padding: { xs: "0.75rem 1rem", md: "1rem 2rem" },
            display: "flex",
            justifyContent: { xs: "space-between", md: "end" },
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <IconButton
            aria-label="Buka menu navigasi"
            onClick={onOpenMobileNav}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              minWidth: "2.75rem",
              minHeight: "2.75rem",
            }}
          >
            <Menu />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "0.1rem",
              }}
            >
              <h4
                style={{
                  textAlign: "end",
                  margin: 0,
                }}
              >
                {user ? user.fullname : "—"}
              </h4>
              <p
                style={{
                  textAlign: "end",
                  margin: 0,
                  fontSize: "0.8rem",
                }}
              >
                {user ? user.role : "—"}
              </p>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AccountCircleRounded
                sx={{
                  fontSize: "2.5rem",
                  color: "grey",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Fragment>
  );
};

export default Topbar;
