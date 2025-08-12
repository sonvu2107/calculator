export default function Key({label, className="", onClick, title}) {
  return (
    <button title={title} className={`btn ${className}`} onClick={onClick}>{label}</button>
  );
}
