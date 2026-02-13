import type { PropsWithChildren } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

export function SectionCard({
  title,
  actions,
  children,
}: PropsWithChildren<{ title: string; actions?: React.ReactNode }>) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={2}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {actions}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}
