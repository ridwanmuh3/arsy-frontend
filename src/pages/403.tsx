import { Typography } from "@mui/material";
import { Fragment } from "react";

const ForbiddenPage = () => {
  return (
    <Fragment>
      <Typography variant="h5">
        Anda tidak diperbolehkan mengakses fitur ini!
      </Typography>
    </Fragment>
  );
};

export default ForbiddenPage;
