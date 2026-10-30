import { describe, expect, it } from "vitest";
import { isValidCpf, maskCpf, maskPhone } from "./br";

describe("br helpers", () => {
  it("accepts a valid CPF and rejects invalid ones", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("529.982.247-24")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });
  it("masks CPF and phone", () => {
    expect(maskCpf("52998224725")).toBe("529.982.247-25");
    expect(maskPhone("11999998888")).toBe("(11) 99999-8888");
  });
});
