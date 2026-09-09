import { Box, Button, Typography } from "@mui/material";
import type { JSX, MouseEvent } from "react";
import { Link } from "react-router";

export type EmptyStateAction = {
  label: string;
  /** Navigasi internal bila aksi berupa tautan. */
  to?: string;
  onClick?: (e: MouseEvent) => void;
};

type EmptyStateProps = {
  icon: JSX.Element;
  title: string;
  description: string;
  action?: EmptyStateAction;
};

/**
 * Empty state terstandar: apa yang akan tampil, mengapa penting,
 * dan satu aksi berikutnya. Ikon diserahkan pemanggil agar kontekstual.
 */
const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        py: "2.5rem",
        px: "1rem",
        textAlign: "center",
      }}
    >
      <Box sx={{ color: "text.disabled", "& svg": { fontSize: "3rem" } }}>
        {icon}
      </Box>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: "28rem" }}
      >
        {description}
      </Typography>
      {action ? (
        action.to ? (
          <Button
            variant="outlined"
            component={Link}
            to={action.to}
            sx={{ mt: 1 }}
          >
            {action.label}
          </Button>
        ) : (
          <Button variant="outlined" onClick={action.onClick} sx={{ mt: 1 }}>
            {action.label}
          </Button>
        )
      ) : null}
    </Box>
  );
};

export default EmptyState;
