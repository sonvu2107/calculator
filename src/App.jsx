import { useCallback, useEffect, useMemo, useState } from "react";
import Display from "./components/Display.jsx";
import Key from "./components/Key.jsx";
import Row from "./components/Row.jsx";
import History from "./components/History.jsx";
import { evaluate } from "./core/calc.js";
import { fmtDisplay, roundFixed } from "./core/format.js";

const LS_HISTORY = "calc-history";
const LS_THEME = "calc-theme";

export default function App(){
  const [expr,setExpr] = useState("");
  const [out,setOut] = useState("0");
  const [angleMode,setAngleMode] = useState("RAD"); // RAD | DEG
  const [mem,setMem] = useState(null); // số
  const [error,setError] = useState("");
  const [ans,setAns] = useState(0);
  const [showHistory,setShowHistory] = useState(true);
  const [history,setHistory] = useState(()=>{
    try{
      return JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
    }catch{ return []; }
  });

  useEffect(()=>{ localStorage.setItem(LS_HISTORY, JSON.stringify(history)); },[history]);

  const vars = useMemo(()=>({ANS: ans}), [ans]);

  const calculate = useCallback((e)=>{
    try{
      const v = evaluate(e ?? expr, angleMode, vars);
      setOut(fmtDisplay(v));
      setError("");
      return v;
    }catch(err){
      setError(err.message || "Lỗi");
      return NaN;
    }
  },[expr, angleMode, vars]);

  const equal = ()=> {
    const v = calculate(expr);
    if (!Number.isNaN(v)) {
      setAns(v);
      setHistory(h=> [{expr, res: fmtDisplay(v), ts: Date.now()}, ...h].slice(0,200));
      setExpr(String(v)); // chain calc
    }
  };

  const clearAll = ()=>{ setExpr(""); setOut("0"); setError(""); };
  const backspace = ()=> setExpr(e=> e.slice(0,-1));
  const append = (s)=> setExpr(e=> e + s);

  // Clipboard
  const copyResult = async ()=>{
    try{
      await navigator.clipboard.writeText(out);
    }catch{}
  };

  // Memory
  const memStore = ()=>{ const v=calculate(expr); if (!Number.isNaN(v)) setMem(v); };
  const memRecall = ()=>{ if (mem!=null) setExpr(e=> e + String(mem)); };
  const memClear = ()=> setMem(null);
  const memPlus = ()=>{ const v=calculate(expr); if (!Number.isNaN(v)) setMem(m=> roundFixed((m||0)+v)); };
  const memMinus = ()=>{ const v=calculate(expr); if (!Number.isNaN(v)) setMem(m=> roundFixed((m||0)-v)); };

  // Unary helpers
  const pushUnaryFunc = (f)=> setExpr(e=> e + f + "(");
  const pushFactorial = ()=> setExpr(e=> e + "!");
  const pushANS = ()=> setExpr(e=> e + "ANS");

  // Keyboard
  useEffect(()=>{
    const onKey = (ev)=>{
      const k = ev.key;
      if (/[0-9.]/.test(k)) { append(k); return; }
      if ("+-*/^()%".includes(k)) { append(k); return; }
      if (k==="Enter"||k==="="){ ev.preventDefault(); equal(); return; }
      if (k==="Backspace"){ backspace(); return; }
      if (k==="Escape"){ clearAll(); return; }
      // Shift+P → %, Shift+1 → !
      if (k==="%") { append("%"); return; }
      if (k==="!") { append("!"); return; }
    };
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  },[equal]);

  // Theme toggle
  const toggleTheme = ()=>{
    const el = document.documentElement;
    const dark = el.classList.toggle("dark");
    localStorage.setItem(LS_THEME, dark ? "dark" : "light");
  };

  const keys = useMemo(()=>[
    ["MC",()=>memClear(),"btn-danger"], ["MR",()=>memRecall()], ["MS",()=>memStore()], ["M+",()=>memPlus()],
    ["M-",()=>memMinus()], ["(",()=>append("(")], [")",()=>append(")")], ["⌫",()=>backspace(),"btn-danger"],
    ["√",()=>pushUnaryFunc("sqrt")], ["1/x",()=>pushUnaryFunc("inv")], ["x!",()=>pushFactorial()], ["%",()=>append("%")],
    ["7",()=>append("7")],["8",()=>append("8")],["9",()=>append("9")],["÷",()=>append("/"),"btn-op"],
    ["4",()=>append("4")],["5",()=>append("5")],["6",()=>append("6")],["×",()=>append("*"),"btn-op"],
    ["1",()=>append("1")],["2",()=>append("2")],["3",()=>append("3")],["−",()=>append("-"),"btn-op"],
    ["ANS",()=>pushANS(),"btn-accent"],["0",()=>append("0")],[".",()=>append(".")],["+",()=>append("+"),"btn-op"],
  ],[mem, ans]);

  return (
    <div className="h-full w-full grid place-items-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Máy Tính</h1>
            <div className="flex gap-2">
              <button className="btn" onClick={()=>setAngleMode(m=> m==="RAD"?"DEG":"RAD")} title="Đổi RAD/DEG">
                {angleMode}
              </button>
              <button className="btn" onClick={toggleTheme} title="Đổi theme">Theme</button>
              <button className="btn btn-danger" onClick={clearAll}>AC</button>
              <button className="btn btn-accent" onClick={equal}>=</button>
            </div>
          </div>

          <Display expr={expr} value={out} mem={mem} mode={angleMode} error={!!error} onCopy={copyResult}/>
          {error && <div className="text-rose-600 text-sm">{error}</div>}

          <div className="grid gap-2">
            <Row>
              <Key label="sin" onClick={()=>append("sin(")} />
              <Key label="cos" onClick={()=>append("cos(")} />
              <Key label="tan" onClick={()=>append("tan(")} />
              <Key label="^"   onClick={()=>append("^")} title="Lũy thừa" />
            </Row>

            {/* Hàng 1: Memory functions */}
            <Row>
              <Key label="MC" onClick={()=>memClear()} className="btn-danger" />
              <Key label="MR" onClick={()=>memRecall()} />
              <Key label="MS" onClick={()=>memStore()} />
              <Key label="M+" onClick={()=>memPlus()} />
            </Row>

            {/* Hàng 2: Memory minus, brackets, backspace */}
            <Row>
              <Key label="M-" onClick={()=>memMinus()} />
              <Key label="(" onClick={()=>append("(")} />
              <Key label=")" onClick={()=>append(")")} />
              <Key label="⌫" onClick={()=>backspace()} className="btn-danger" />
            </Row>

            {/* Hàng 3: Functions */}
            <Row>
              <Key label="√" onClick={()=>pushUnaryFunc("sqrt")} />
              <Key label="1/x" onClick={()=>pushUnaryFunc("inv")} />
              <Key label="x!" onClick={()=>pushFactorial()} />
              <Key label="%" onClick={()=>append("%")} />
            </Row>

            {/* Hàng 4: Số 7-8-9 và chia */}
            <Row>
              <Key label="7" onClick={()=>append("7")} />
              <Key label="8" onClick={()=>append("8")} />
              <Key label="9" onClick={()=>append("9")} />
              <Key label="÷" onClick={()=>append("/")} className="btn-op" />
            </Row>

            {/* Hàng 5: Số 4-5-6 và nhân */}
            <Row>
              <Key label="4" onClick={()=>append("4")} />
              <Key label="5" onClick={()=>append("5")} />
              <Key label="6" onClick={()=>append("6")} />
              <Key label="×" onClick={()=>append("*")} className="btn-op" />
            </Row>

            {/* Hàng 6: Số 1-2-3 và trừ */}
            <Row>
              <Key label="1" onClick={()=>append("1")} />
              <Key label="2" onClick={()=>append("2")} />
              <Key label="3" onClick={()=>append("3")} />
              <Key label="−" onClick={()=>append("-")} className="btn-op" />
            </Row>

            {/* Hàng 7: ANS, 0, dấu chấm và cộng */}
            <Row>
              <Key label="ANS" onClick={()=>pushANS()} className="btn-accent" />
              <Key label="0" onClick={()=>append("0")} />
              <Key label="." onClick={()=>append(".")} />
              <Key label="+" onClick={()=>append("+")} className="btn-op" />
            </Row>

            {/* Debug: In ra số lượng keys */}
            {/* {console.log('Total keys:', keys.length)} */}
          </div>

          <div className="text-xs opacity-70">
            Phím tắt: 0-9, + − × ÷ (*,/), ^, ( ), ., %, !, Enter = bằng, Esc = AC, Backspace = xóa. Dùng <b>ANS</b> để gọi kết quả gần nhất.
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Bảng điều khiển</h2>
            <button className="btn" onClick={()=>setShowHistory(v=>!v)}>{showHistory?"Ẩn":"Hiện"} lịch sử</button>
          </div>

          {showHistory && (
            <History
              items={history}
              onUse={(it)=>{ setExpr(it.res); setOut(it.res); setAns(parseFloat(it.res)); }}
              onClear={()=>setHistory([])}
            />
          )}
        </div>
      </div>
    </div>
  );
}
