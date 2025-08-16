import { Box } from "@mui/material";
import { Fragment } from "react";
import { grey } from "@mui/material/colors";
import { AccountCircleRounded } from "@mui/icons-material";
import { getUserFromToken } from "../lib/auth";

const Topbar = () => {
  const user = getUserFromToken();
  return (
    <Fragment>
      <Box
        sx={{
          paddingLeft: "17rem",
          borderBottom: 1,
          borderBottomColor: grey[300],
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "4.4rem",
            padding: "1rem 2rem",
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
              {user ? user.fullname : "John Doe"}
            </h4>
            <p
              style={{
                textAlign: "end",
                margin: 0,
                fontSize: "0.8rem",
              }}
            >
              {user ? user.role : "Unknown"}
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
    </Fragment>
  );
};

export default Topbar;
