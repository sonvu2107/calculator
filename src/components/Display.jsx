export default function Display({expr, value, mem, mode, error, onCopy}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between text-xs opacity-70 mb-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded border">{mode}</span>
          {mem!=null && <span className="px-2 py-0.5 rounded border">M</span>}
        </div>
        <button className="text-xs underline opacity-80 hover:opacity-100" onClick={onCopy} title="Copy kết quả">
          Copy
        </button>
      </div>
      <div className="text-sm min-h-5 opacity-80 break-all">{expr || "\u00A0"}</div>
      <div className={`text-3xl font-semibold text-right ${error?"text-rose-600":""}`}>
        {value}
      </div>
    </div>
  );
}
