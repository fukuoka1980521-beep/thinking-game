from __future__ import annotations
import argparse, json
from pathlib import Path
from study_lib_v01 import create_blind_packet

BASE = Path(__file__).resolve().parent

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--track", choices=["RQ-A","RQ-B"], required=True)
    ap.add_argument("--event-id", required=True)
    args=ap.parse_args()
    packet=create_blind_packet(BASE,args.track,args.event_id)
    print(json.dumps(packet,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
