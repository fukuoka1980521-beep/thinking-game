from __future__ import annotations
import math,re
from collections import Counter
import numpy as np

METHODS=['GENERIC','BAYESIAN','SOFTWARE_TESTING']
STAGES=['BASE','SFT','DPO','RLVR']
HEADINGS=['objective and scope','assumptions','research design','data or evidence needed','measurement','analysis','decision / stopping rule','limitations']
MASK=[
 'bayesian methodological approach','bayesian','bayes','prior','priors','posterior','posteriors','likelihood','likelihoods','bayes factor','bayes factors','credible interval','credible intervals',
 'software testing methodological approach','software testing','unit test','unit tests','integration test','integration tests','regression test','regression tests','metamorphic test','metamorphic tests','test oracle','test oracles','test case','test cases','test harness','test harnesses','fuzz test','fuzz tests','boundary test','boundary tests'
]

def normalize(text):
 t=text.lower().replace('–','-').replace('—','-').replace('−','-')
 t=re.sub(r'[-_/]+',' ',t)
 for h in HEADINGS: t=re.sub(r'\b'+re.escape(h.replace('-',' '))+r'\b',' ',t)
 for x in sorted(MASK,key=len,reverse=True): t=re.sub(r'(?<![a-z])'+re.escape(x.replace('-',' '))+r'(?![a-z])',' ',t)
 t=re.sub(r'[^a-z\s]',' ',t); return re.sub(r'\s+',' ',t).strip()

def features(text):
 ts=[x for x in normalize(text).split() if len(x)>=2]
 out=['u:'+x for x in ts]; out += ['b:'+ts[i]+'_'+ts[i+1] for i in range(len(ts)-1)]
 return out

def fit_idf(texts):
 docs=[features(t) for t in texts]; df=Counter(); [df.update(set(d)) for d in docs]; n=len(docs)
 return {f:math.log((1+n)/(1+c))+1 for f,c in df.items()}

def vec(text,idf):
 c=Counter(f for f in features(text) if f in idf); v={f:(1+math.log(n))*idf[f] for f,n in c.items()}; z=math.sqrt(sum(x*x for x in v.values()))
 return {k:x/z for k,x in v.items()} if z else {}

def dot(a,b):
 if len(a)>len(b): a,b=b,a
 return sum(x*b.get(k,0) for k,x in a.items())
def classify(train,test,label_key,classes):
 idf=fit_idf([r['text'] for r in train]); tv=[vec(r['text'],idf) for r in train]; xv=[vec(r['text'],idf) for r in test]
 cents=[]
 for c in classes:
  z=[v for r,v in zip(train,tv) if r[label_key]==c]
  keys=set(k for v in z for k in v); cent={k:sum(v.get(k,0) for v in z)/len(z) for k in keys} if z else {}
  norm=math.sqrt(sum(x*x for x in cent.values())); cents.append({k:x/norm for k,x in cent.items()} if norm else {})
 preds=[classes[int(np.argmax([dot(v,c) for c in cents]))] for v in xv]
 truth=[r[label_key] for r in test]
 return {'correct':sum(a==b for a,b in zip(preds,truth)),'n':len(test),'accuracy':sum(a==b for a,b in zip(preds,truth))/len(test),'predictions':[{'id':r['id'],'true':t,'pred':p} for r,t,p in zip(test,truth,preds)]}

def compliance(text):
 low=text.lower(); present=sum(h in low for h in HEADINGS)
 refusal=bool(re.search(r"\b(i can(?:not|'t)|unable to|cannot comply|sorry)\b",low))
 words=len(re.findall(r'\b\w+\b',text))
 return {'headings_present':int(present),'all_headings':present==len(HEADINGS),'refusal_like':refusal,'word_count':words,'nonempty':bool(text.strip())}
