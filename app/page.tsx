import React from "react";
import { getLibraries } from "lib/libraries";
import ClientPage from "./ClientPage";

export default async function Page() {
  const items = await getLibraries();
  const ts = new Date().toISOString();

  return <ClientPage items={items} ts={ts} />;
}
