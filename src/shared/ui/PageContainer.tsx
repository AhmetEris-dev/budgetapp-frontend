import type { PropsWithChildren } from "react";
import { Container } from "@mui/material";

export function PageContainer({ children }: PropsWithChildren) {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {children}
    </Container>
  );
}
