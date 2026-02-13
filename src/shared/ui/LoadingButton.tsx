import { Button, CircularProgress } from "@mui/material";

export function LoadingButton(props: {
  loading: boolean;
  label: string;
  type?: "button" | "submit";
  onClick?: () => void;
  variant?: "contained" | "outlined" | "text";
  disabled?: boolean;
}) {
  const { loading, label, type = "button", onClick, variant = "contained", disabled } = props;

  return (
    <Button
      type={type}
      onClick={onClick}
      variant={variant}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={18} /> : undefined}
    >
      {label}
    </Button>
  );
}
