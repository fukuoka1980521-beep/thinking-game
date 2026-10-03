from __future__ import annotations
import json, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'runtime_benchmark'
OUT.mkdir(exist_ok=True)
MODEL=Path(r'C:\Users\user\ClaudeWork\_research_runtime\models\tmi-pilot\OLMo-2-1124-7B.Q4_K_M.gguf')
BENCH=Path(r'C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-bench.exe')

def run(label,extra):
    cmd=[str(BENCH),'-m',str(MODEL),'-p','128','-n','128','-r','2','-t','10','-o','json',*extra]
    cp=subprocess.run(cmd,capture_output=True,text=True,timeout=1800)
    (OUT/f'{label}.stdout.json').write_text(cp.stdout,encoding='utf-8')
    (OUT/f'{label}.stderr.log').write_text(cp.stderr,encoding='utf-8')
    result={'label':label,'returncode':cp.returncode,'command':cmd}
    if cp.returncode!=0:
        result['error']='benchmark_nonzero'
        return result
    try:
        rows=json.loads(cp.stdout)
    except Exception as e:
        result['error']=f'json_parse:{type(e).__name__}:{e}'
        return result
    pp=[x for x in rows if int(x.get('n_prompt',0) or 0)>0 and int(x.get('n_gen',0) or 0)==0]
    tg=[x for x in rows if int(x.get('n_gen',0) or 0)>0]
    if not pp or not tg:
        result['error']='missing_pp_or_tg'
        result['rows']=rows
        return result
    pp_ts=float(pp[-1]['avg_ts']); tg_ts=float(tg[-1]['avg_ts'])
    est=275.0/pp_ts+512.0/tg_ts
    result.update({'prompt_tps':pp_ts,'generation_tps':tg_ts,'estimated_275p_512g_seconds':est,'rows':rows})
    return result

cpu=run('cpu',['-ngl','0'])
vulkan=run('vulkan',['-ngl','99','-dev','Vulkan0'])
cpu_ok='error' not in cpu
vk_ok='error' not in vulkan
selected='cpu'
if cpu_ok and vk_ok and vulkan['estimated_275p_512g_seconds'] <= 0.80*cpu['estimated_275p_512g_seconds']:
    selected='vulkan'
elif (not cpu_ok) and vk_ok:
    selected='vulkan'

selection={
 'status':'RUNTIME_SPEED_GATE_COMPLETE',
 'selection_rule':'vulkan iff successful and estimated_275p_512g_seconds <= 0.80 * CPU; CPU fallback',
 'selected_backend':selected,
 'gpu_layers':99 if selected=='vulkan' else 0,
 'device':'Vulkan0' if selected=='vulkan' else 'none',
 'representative_workload':{'prompt_tokens':275,'generation_tokens':512},
 'cpu':cpu,
 'vulkan':vulkan,
 'llama_cpp_commit':'4e7481175cbd4759df8bee2f1c1a0073effbebd7',
 'model_sha256':'3e706ed3e2cba388e8eba78d90cebd023cddc1be796e000cbc6ea6c5b97eeab0',
}
(OUT/'RUNTIME_SELECTION.json').write_text(json.dumps(selection,indent=2),encoding='utf-8')
lines=['# Runtime Speed Gate Result','',f"**Selected backend: {selected.upper()}**",'']
for x in (cpu,vulkan):
    if 'error' in x:
        lines.append(f"- {x['label']}: ERROR {x['error']}")
    else:
        lines.append(f"- {x['label']}: prompt {x['prompt_tps']:.2f} tok/s; generation {x['generation_tps']:.2f} tok/s; estimated 275p+512g {x['estimated_275p_512g_seconds']:.1f} s")
(OUT/'RUNTIME_SPEED_GATE_RESULT.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('RUNTIME_SPEED_GATE=PASS')
print('SELECTED='+selected.upper())
