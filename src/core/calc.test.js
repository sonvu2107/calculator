import { describe, it, expect } from "vitest";
import { evaluate } from "./calc";

describe("Calculator core", ()=>{
  it("percent add/sub", ()=>{
    expect(evaluate("200+10%")).toBe(220);
    expect(evaluate("200-10%")).toBe(180);
  });
  it("percent mul/div", ()=>{
    expect(evaluate("200*10%")).toBe(20);
    expect(evaluate("200/10%")).toBe(2000);
  });
  it("factorial", ()=>{
    expect(evaluate("5!")).toBe(120);
  });
  it("precedence", ()=>{
    expect(evaluate("2+3*4")).toBe(14);
    expect(evaluate("(2+3)*4")).toBe(20);
    expect(evaluate("2^10")).toBe(1024);
  });
  it("trig DEG", ()=>{
    expect(evaluate("sin(30)","DEG")).toBeCloseTo(0.5, 12);
  });
  it("ANS var", ()=>{
    expect(evaluate("ANS+2","RAD",{ANS:5})).toBe(7);
  });
});
