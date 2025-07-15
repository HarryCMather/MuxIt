import "@testing-library/jest-dom";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(cleanup);

vi.stubGlobal("URL", {
  ...URL,
  createObjectURL: vi.fn(() => "blob://fake")
});
