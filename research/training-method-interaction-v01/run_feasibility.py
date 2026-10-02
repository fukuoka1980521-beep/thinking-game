from __future__ import annotations
import argparse, hashlib, json, os, time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG = ROOT / "FEASIBILITY_CONFIG.json"
RAW = ROOT / "feasibility" / "raw"
CACHE = Path(r"C:\Users\user\ClaudeWork\_model_cache\training-method-v01")

HEADINGS = """OUTPUT REQUIREMENTS (identical across conditions):
Produce a research plan only, with these neutral headings:
1. Objective and scope
2. Assumptions
3. Research design
4. Data or evidence needed
5. Measurement
6. Analysis
7. Decision / stopping rule
8. Limitations

Within those headings, include whatever elements you judge scientifically necessary.
Do not mention that you are in an experiment comparing methodologies.
Do not use external tools."""
def utcnow():
    return datetime.now(timezone.utc).isoformat()

def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def build_prompt(objective: str, instruction: str) -> str:
    return f"""RESEARCH OBJECTIVE (identical within task):
{objective}

METHODOLOGICAL FRAMING:
{instruction}

{HEADINGS}"""

def load_config():
    return json.loads(CONFIG.read_text(encoding="utf-8-sig"))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stage", required=True, choices=["BASE", "SFT", "DPO", "RLVR"])
    ap.add_argument("--method", required=True)
    ap.add_argument("--task", default="T1")
    ap.add_argument("--seed", type=int, default=20261003)
    ap.add_argument("--max-new-tokens", type=int, default=160)
    ap.add_argument("--interface", choices=["SHARED_RAW", "NATIVE_CHAT"], default="SHARED_RAW")
    args = ap.parse_args()

    cfg = load_config()
    if args.method not in cfg["methods"]:
        raise SystemExit("unknown method")
    if args.task not in cfg["tasks"]:
        raise SystemExit("unknown task")

    import torch
    from huggingface_hub import model_info
    from transformers import AutoModelForCausalLM, AutoTokenizer

    os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
    torch.manual_seed(args.seed)
    torch.set_num_threads(max(1, min(8, os.cpu_count() or 1)))

    model_id = cfg["models"][args.stage]
    revision = model_info(model_id).sha
    prompt = build_prompt(cfg["tasks"][args.task], cfg["methods"][args.method])

    CACHE.mkdir(parents=True, exist_ok=True)
    start_load = time.perf_counter()
    tokenizer = AutoTokenizer.from_pretrained(
        model_id, cache_dir=str(CACHE), revision=revision
    )
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        cache_dir=str(CACHE),
        revision=revision,
        dtype="auto",
        low_cpu_mem_usage=True,
    )
    model.eval()
    load_seconds = time.perf_counter() - start_load

    if tokenizer.pad_token_id is None:
        tokenizer.pad_token_id = tokenizer.eos_token_id

    if args.interface == "NATIVE_CHAT":
        if not tokenizer.chat_template:
            raise SystemExit("NATIVE_CHAT requested but tokenizer has no chat template")
        input_text = tokenizer.apply_chat_template(
            [{"role": "user", "content": prompt}],
            tokenize=False,
            add_generation_prompt=True,
        )
    else:
        input_text = prompt

    encoded = tokenizer(input_text, return_tensors="pt")
    input_tokens = int(encoded["input_ids"].shape[-1])

    gen_kwargs = {
        "max_new_tokens": args.max_new_tokens,
        "do_sample": True,
        "temperature": 0.8,
        "top_p": 0.95,
        "pad_token_id": tokenizer.pad_token_id,
        "eos_token_id": tokenizer.eos_token_id,
    }

    start_gen = time.perf_counter()
    with torch.inference_mode():
        out = model.generate(**encoded, **gen_kwargs)
    generation_seconds = time.perf_counter() - start_gen

    new_ids = out[0, input_tokens:]
    raw_text = tokenizer.decode(new_ids, skip_special_tokens=True)
    output_tokens = int(new_ids.shape[-1])

    record = {
        "status": "NON_COUNTED_FEASIBILITY",
        "counted": False,
        "paid_api_calls": 0,
        "timestamp_utc": utcnow(),
        "stage": args.stage,
        "model_id": model_id,
        "model_revision": revision,
        "tokenizer_class": tokenizer.__class__.__name__,
        "tokenizer_vocab_size": len(tokenizer),
        "has_chat_template": bool(tokenizer.chat_template),
        "interface": args.interface,
        "method_family": args.method,
        "task_id": args.task,
        "seed": args.seed,
        "prompt_text": prompt,
        "prompt_sha256": sha256_text(prompt),
        "input_text_sha256": sha256_text(input_text),
        "generation_settings": gen_kwargs,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "load_seconds": load_seconds,
        "generation_seconds": generation_seconds,
        "tokens_per_second": (
            output_tokens / generation_seconds if generation_seconds > 0 else None
        ),
        "raw_text": raw_text,
    }

    RAW.mkdir(parents=True, exist_ok=True)
    name = (
        f"{args.stage}-{args.interface}-{args.task}-"
        f"{args.method}-S{args.seed}.json"
    )
    dest = RAW / name
    dest.write_text(
        json.dumps(record, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("FEASIBILITY_GENERATION=PASS")
    print("STAGE=" + args.stage)
    print("MODEL=" + model_id)
    print("REVISION=" + revision)
    print("INPUT_TOKENS=" + str(input_tokens))
    print("OUTPUT_TOKENS=" + str(output_tokens))
    print(f"LOAD_SECONDS={load_seconds:.3f}")
    print(f"GEN_SECONDS={generation_seconds:.3f}")
    print(f"TOKENS_PER_SECOND={record['tokens_per_second']:.4f}")
    print("OUTPUT=" + str(dest))

if __name__ == "__main__":
    main()
