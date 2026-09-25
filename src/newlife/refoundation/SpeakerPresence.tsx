import type { CSSProperties } from "react";

export type PresenceSpeaker = "MIKA" | "RYO";

interface Props {
  activeSpeaker: PresenceSpeaker | null;
  activeText: string | null;
  pending: boolean;
}

const CARD_BASE: CSSProperties = {
  flex: "1 1 180px",
  minWidth: 150,
  maxWidth: 230,
  border: "1px solid #c8ccd2",
  borderRadius: 14,
  padding: 12,
  background: "#f4f5f7",
  opacity: 0.55,
  transform: "translateY(5px) scale(0.98)",
  transition: "180ms ease",
};

function CharacterCard({
  id,
  name,
  active,
  pending,
}: {
  id: PresenceSpeaker;
  name: string;
  active: boolean;
  pending: boolean;
}) {
  return (
    <article
      aria-label={`${name}の立ち位置`}
      aria-current={active ? "true" : undefined}
      data-speaking={active ? "true" : "false"}
      style={{
        ...CARD_BASE,
        ...(active
          ? {
              opacity: 1,
              transform: "translateY(0) scale(1.02)",
              background: "#fff",
              border: "2px solid #555",
              boxShadow: "0 8px 24px rgba(0,0,0,.12)",
            }
          : {}),
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 72,
          height: 72,
          margin: "0 auto 8px",
          borderRadius: "50%",
          border: "1px solid #777",
          position: "relative",
          background: id === "MIKA" ? "#eadde3" : "#dce5ef",
        }}
      >
        <span style={{ position: "absolute", left: 18, top: 27, width: 6, height: 4, borderRadius: "50%", background: "#333" }} />
        <span style={{ position: "absolute", right: 18, top: 27, width: 6, height: 4, borderRadius: "50%", background: "#333" }} />
        <span
          className={active && !pending ? "newlife-mouth-speaking" : ""}
          style={{
            position: "absolute",
            left: "50%",
            top: 47,
            width: 20,
            height: 3,
            marginLeft: -10,
            borderRadius: 6,
            background: "#704a4a",
            transformOrigin: "center",
          }}
        />
      </div>
      <div style={{ textAlign: "center", fontWeight: active ? 700 : 500 }}>{name}</div>
      <div style={{ textAlign: "center", fontSize: 11, color: "#666", minHeight: 18 }}>
        {active ? (pending ? "考えている…" : "話している") : ""}
      </div>
    </article>
  );
}

export function SpeakerPresence({ activeSpeaker, activeText, pending }: Props) {
  const speakerName = activeSpeaker === "MIKA" ? "美香" : activeSpeaker === "RYO" ? "亮" : "会話";

  return (
    <section
      aria-label="会話中の人物"
      style={{
        border: "1px solid #bbb",
        borderRadius: 12,
        padding: 12,
        margin: "12px 0",
        background: "linear-gradient(#f7f4f1, #eceef2)",
      }}
    >
      <style>{`
        @keyframes newlife-mouth-talk {
          from { transform: scaleY(1); height: 3px; }
          to { transform: scaleY(2.7); height: 5px; }
        }
        .newlife-mouth-speaking {
          animation: newlife-mouth-talk .34s ease-in-out infinite alternate;
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <CharacterCard id="MIKA" name="美香" active={activeSpeaker === "MIKA"} pending={pending} />
        <CharacterCard id="RYO" name="亮" active={activeSpeaker === "RYO"} pending={pending} />
      </div>

      {activeText && (
        <div
          aria-live="polite"
          style={{
            marginTop: 10,
            borderRadius: 10,
            background: "#171b22",
            color: "#fff",
            padding: "12px 14px",
            lineHeight: 1.65,
          }}
        >
          <strong>{speakerName}: </strong>
          {activeText}
        </div>
      )}
    </section>
  );
}
