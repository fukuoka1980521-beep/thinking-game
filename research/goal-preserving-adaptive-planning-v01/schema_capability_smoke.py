from __future__ import annotations
import json, subprocess, time, urllib.request
from pathlib import Path

MODEL=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B-Instruct.Q4_K_M.gguf')
SERVER=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe')
PORT=18088

def http(path,payload=None,timeout=120):
    data=json.dumps(payload).encode('utf-8') if payload is not None else None
    req=urllib.request.Request(f'http://127.0.0.1:{PORT}{path}',data=data,headers={'Content-Type':'application/json'} if data else {})
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read().decode())

proc=subprocess.Popen([str(SERVER),'-m',str(MODEL),'--host','127.0.0.1','--port',str(PORT),'-c','4096','-t','10','-ngl','0','-np','1','--alias','schema-test','--no-ui','--log-disable'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
    for _ in range(180):
        try:
            if http('/health',timeout=2).get('status')=='ok':break
        except: pass
        time.sleep(1)
    payload={
      'model':'schema-test',
      'messages':[{'role':'user','content':'Choose the authorized next work item and route. Explain the action briefly.'}],
      'temperature':0.7,
      'max_tokens':100,
      'response_format':{
        'type':'json_schema',
        'json_schema':{
          'name':'authorized_action',
          'strict':True,
          'schema':{
            'type':'object',
            'properties':{
              'open_id':{'type':'string','enum':['O1']},
              'route_id':{'type':'string','enum':['V1']},
              'action':{'type':'string'}
            },
            'required':['open_id','route_id','action'],
            'additionalProperties':False
          }
        }
      }
    }
    r=http('/v1/chat/completions',payload,timeout=180)
    print(r['choices'][0]['message']['content'])
finally:
    try:proc.terminate()
    except:pass
