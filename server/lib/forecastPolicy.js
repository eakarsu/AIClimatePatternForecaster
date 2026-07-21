class ForecastError extends Error{constructor(message,status=400){super(message);this.status=status;}}
const text=(v,n,max=2000)=>{if(typeof v!=='string'||!v.trim())throw new ForecastError(`${n} is required`);const x=v.trim();if(x.length>max)throw new ForecastError(`${n} is too long`);return x;};
const finite=(v,n)=>{const x=Number(v);if(!Number.isFinite(x))throw new ForecastError(`${n} must be finite`);return x;};
function interval(point,lower,upper){const p=finite(point,'point'),l=finite(lower,'lower'),u=finite(upper,'upper');if(l>p||p>u)throw new ForecastError('Uncertainty interval must contain point estimate');return{point:p,lower:l,upper:u};}
function unsupportedClaim(value){const normalized=String(value||'').replace(/not (?:an )?official warning/gi,'');return /\b(guaranteed|certain|no risk|safe to operate|official warning)\b/i.test(normalized);}
function requireRole(role,allowed){if(!allowed.includes(role))throw new ForecastError('Reviewer role required',403);}
function idempotency(req){const k=req.get('Idempotency-Key');if(!k||!/[A-Za-z0-9._:-]{8,128}/.test(k))throw new ForecastError('Valid Idempotency-Key required');return k;}
module.exports={ForecastError,text,finite,interval,unsupportedClaim,requireRole,idempotency};
