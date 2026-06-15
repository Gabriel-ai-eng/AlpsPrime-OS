import { useState, useRef } from "react";
import { Image, Music, MapPin, Smile, Tag } from "lucide-react";

export default function PostInput({ user, onPost }) {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);

  const actions = [
    {
      icon: <Image size={20} />,
      label: "Foto/Vídeo",
      color: "#4CAF50",
      onClick: () => fileInputRef.current.click(),
    },
    {
      icon: <Music size={20} />,
      label: "Música",
      color: "#E91E63",
      onClick: () => alert("Adicionar música"),
    },
    {
      icon: <MapPin size={20} />,
      label: "Localização",
      color: "#F44336",
      onClick: () => alert("Adicionar localização"),
    },
    {
      icon: <Smile size={20} />,
      label: "Humor",
      color: "#FF9800",
      onClick: () => alert("Como você está?"),
    },
    {
      icon: <Tag size={20} />,
      label: "Marcar amigos",
      color: "#2196F3",
      onClick: () => alert("Marcar pessoas"),
    },
  ];

  return (
    <div style={{
      background: "#fffdf7",
      borderRadius: "16px",
      padding: "16px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Input de texto */}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <img
          src={user?.avatar || "https://i.pravatar.cc/40"}
          alt="avatar"
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Compartilhe algo com a Sexta..."
          rows={2}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: "15px",
            color: "#2d1f0e",
            background: "transparent",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Divisor */}
      <div style={{ height: "1px", background: "#f0e8d8", margin: "12px 0" }} />

      {/* Barra de ações */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Ícones de ação */}
        <div style={{ display: "flex", gap: "4px" }}>
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              title={action.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
                background: "transparent",
                color: action.color,
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f5efe6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {action.icon}
              <span style={{ display: window.innerWidth > 500 ? "inline" : "none" }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Botão publicar */}
        <button
          disabled={!text.trim()}
          onClick={() => onPost?.(text)}
          style={{
            padding: "8px 20px",
            borderRadius: "10px",
            border: "none",
            background: text.trim() ? "#b8860b" : "#e0d8cc",
            color: text.trim() ? "#fff" : "#aaa",
            fontWeight: "600",
            fontSize: "14px",
            cursor: text.trim() ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >
          Publicar
        </button>

        {/* Input de arquivo escondido */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={(e) => console.log(e.target.files[0])}
        />
      </div>
    </div>
  );
}