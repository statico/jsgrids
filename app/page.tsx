import React from "react";
import { getLibraries } from "@/lib/libraries";
import IndexPage from "../components/IndexPage";

export const maxDuration = 60;

export default async function Page() {
  const items = await getLibraries();
  const ts = new Date().toISOString();

  return <IndexPage items={items} ts={ts} />;
}
