import { useEffect } from "react";
import Container from "../components/Container";
import { LocalStorageKeys } from "@lib/consts";

export default function Changelog() {
  useEffect(() => {
    localStorage.setItem(LocalStorageKeys.isOnboarded, "yes");
  }, []);

  return (
    <Container sx={{ maxWidth: "924px" }}>
      Hi! This page was opened by default because you wanted to be onboarded!
    </Container>
  );
}
