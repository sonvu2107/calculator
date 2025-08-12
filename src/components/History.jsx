export default function History({items, onUse, onClear}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Lịch sử</h3>
        <button className="btn btn-danger text-sm py-1 px-3" onClick={onClear}>Xóa</button>
      </div>
      <div className="max-h-64 overflow-auto space-y-2">
        {items.length===0 && <div className="text-sm opacity-70">Chưa có phép tính</div>}
        {items.map((it, idx)=>(
          <button key={idx} className="w-full text-left p-2 rounded border hover:bg-white/50 dark:hover:bg-slate-700/50"
                  onClick={()=>onUse(it)}>
            <div className="text-xs opacity-70">{new Date(it.ts).toLocaleString()}</div>
            <div className="text-sm break-all">{it.expr} = <b>{it.res}</b></div>
          </button>
        ))}
      </div>
    </div>
  );
}
