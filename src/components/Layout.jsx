import * as React from 'react';
import Container from '@mui/material/Container';

export default function Layout({ children, sx }) {
  return (
    <Container maxWidth='lg' sx={(theme) => ({ ...sx })}>
      {children}
    </Container>
  );
}
