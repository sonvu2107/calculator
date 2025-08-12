import { roundFixed } from "./format";

// Ưu tiên: ! (postfix) > unary ± > ^ > * / > + -
// Token: number, + - * / ^ ( ) % !, func: sin cos tan sqrt inv
const PREC = { "!":5, "u±":4, "^":3, "*":2, "/":2, "+":1, "-":1 };
const RIGHT_ASSOC = { "^": true };

function isDigit(ch){return /[0-9]/.test(ch);}

export function tokenize(input){
  const s = input.replace(/\s+/g,"");
  const out = [];
  let i=0;
  while(i<s.length){
    const c = s[i];
    if (isDigit(c) || (c===".")) {
      let j=i+1;
      while(j<s.length && /[0-9.]/.test(s[j])) j++;
      out.push({type:"num", value: s.slice(i,j)});
      i=j; continue;
    }
    // func
    const rest = s.slice(i);
    const m = /^(sin|cos|tan|sqrt|inv)/.exec(rest);
    if (m){ out.push({type:"func", value:m[1]}); i+=m[1].length; continue; }

    if ("+-*/^()%!".includes(c)){
      out.push({type:"op", value:c});
      i++; continue;
    }
    throw new Error("Ký tự không hợp lệ: "+c);
  }
  return out;
}

export function toRPN(tokens){
  const out=[], st=[];
  let prev=null;
  for(const t of tokens){
    if (t.type==="num") { out.push(t); prev=t; continue; }
    if (t.type==="func") { st.push(t); prev=t; continue; }
    if (t.type==="op"){
      if (t.value==="(") { st.push(t); prev=t; continue; }
      if (t.value===")"){
        while(st.length && st[st.length-1].value!=="(") out.push(st.pop());
        if (!st.length) throw new Error("Ngoặc sai");
        st.pop();
        if (st.length && st[st.length-1].type==="func") out.push(st.pop());
        prev=t; continue;
      }
      // unary +/-
      if (t.value==="+" || t.value==="-" ){
        const unary = (!prev || (prev.type==="op" && prev.value!=="%" && prev.value!==")") || (prev.type==="func"));
        if (unary){
          out.push({type:"num", value:"0"});
        }
      }
      // postfix ! %
      if (t.value==="!" || t.value==="%"){
        while(st.length && st[st.length-1].type==="op" && PREC[st[st.length-1].value] > PREC["!"])
          out.push(st.pop());
        st.push(t);
        prev=t; continue;
      }

      // binary
      while(st.length){
        const top = st[st.length-1];
        if (top.type==="op" && top.value!=="("){
          const pTop = PREC[top.value] ?? 0, pCur = PREC[t.value] ?? 0;
          if ((RIGHT_ASSOC[t.value] ? pCur < pTop : pCur <= pTop)) out.push(st.pop());
          else break;
        } else if (top.type==="func"){ out.push(st.pop()); }
        else break;
      }
      st.push(t);
      prev=t; continue;
    }
  }
  while(st.length){
    const x=st.pop();
    if (x.value==="("||x.value===")") throw new Error("Ngoặc sai");
    out.push(x);
  }
  return out;
}

function fact(n){
  if (!Number.isInteger(n) || n<0) throw new Error("n! yêu cầu số nguyên ≥0");
  if (n>170) throw new Error("Quá lớn (n ≤ 170)");
  let r=1;
  for(let i=2;i<=n;i++) r = roundFixed(r*i);
  return r;
}

function toRad(x, mode){ return mode==="DEG" ? (x*Math.PI/180) : x; }

export function evalRPN(rpn, {angleMode="RAD", percentCtx=null}={}){
  const st=[];
  for(let i=0;i<rpn.length;i++){
    const t = rpn[i];
    if (t.type==="num"){ st.push(roundFixed(parseFloat(t.value))); continue; }
    if (t.type==="func"){
      const a = st.pop(); if (a===undefined) throw new Error("Thiếu toán hạng");
      switch(t.value){
        case "sqrt": if (a<0) throw new Error("√x: x ≥ 0"); st.push(roundFixed(Math.sqrt(a))); break;
        case "inv": if (a===0) throw new Error("1/0 không xác định"); st.push(roundFixed(1/a)); break;
        case "sin": st.push(roundFixed(Math.sin(toRad(a, angleMode)))); break;
        case "cos": st.push(roundFixed(Math.cos(toRad(a, angleMode)))); break;
        case "tan": {
          const v = Math.tan(toRad(a, angleMode));
          if (!isFinite(v)) throw new Error("tan không xác định");
          st.push(roundFixed(v)); break;
        }
        default: throw new Error("Hàm không hỗ trợ");
      }
      continue;
    }
    if (t.type==="op"){
      if (t.value==="!"){
        const a = st.pop(); st.push(fact(a)); continue;
      }
      if (t.value==="%"){
        const a = st.pop();
        if (percentCtx && (percentCtx.lastOp==="+" || percentCtx.lastOp==="-" )) {
          st.push(roundFixed(percentCtx.lastA * (a/100)));
        } else {
          st.push(roundFixed(a/100));
        }
        continue;
      }
      const b = st.pop(), a = st.pop();
      if (a===undefined || b===undefined) throw new Error("Thiếu toán hạng");
      switch(t.value){
        case "+": st.push(roundFixed(a+b)); break;
        case "-": st.push(roundFixed(a-b)); break;
        case "*": st.push(roundFixed(a*b)); break;
        case "/": if (b===0) throw new Error("Chia cho 0"); st.push(roundFixed(a/b)); break;
        case "^": st.push(roundFixed(Math.pow(a,b))); break;
        default: throw new Error("Toán tử không hỗ trợ");
      }
      continue;
    }
  }
  if (st.length!==1) throw new Error("Biểu thức không hợp lệ");
  return st[0];
}

// Cho phép biến đơn giản: ANS
function substituteVars(expr, vars){
  if (!vars) return expr;
  return expr.replace(/\bANS\b/gi, String(vars.ANS ?? 0));
}

// API cao: evaluateWithVars("2+ANS", {ANS:5})
export function evaluate(expr, angleMode="RAD", vars=null){
  const expr2 = substituteVars(expr, vars);
  const tokens = tokenize(expr2);

  // Ngữ cảnh %: lấy toán hạng trái gần nhất + toán tử
  let lastA=null, lastOp=null;
  for (let i=0;i<tokens.length;i++){
    if (tokens[i].type==="op" && "+-*/".includes(tokens[i].value)) {
      for (let j=i-1;j>=0;j--){
        if (tokens[j].type==="num"){ lastA = parseFloat(tokens[j].value); break; }
      }
      lastOp = tokens[i].value;
    }
  }
  const rpn = toRPN(tokens);
  return evalRPN(rpn, {angleMode, percentCtx: (lastA!=null?{lastA,lastOp}:null)});
}
