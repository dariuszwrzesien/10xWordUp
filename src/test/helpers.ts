import React from "react";

// This file adds React to the global scope for test files
// that don't explicitly import it
declare global {
  const React: typeof import("react");
}

(globalThis as unknown as { React: typeof React }).React = React;
