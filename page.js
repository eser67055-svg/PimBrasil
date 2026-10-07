 "use client";
import {useEffect,useState} from "react";
import {Heart,MessageCircle,Bookmark,Search,Plus,UserCircle,LogIn,LogOut,ImagePlus} from "lucide-react";
import {supabaseBrowser} from "../lib/supabase";

const demo=[
 {id:"demo1",title:"Brasília ao entardecer",category:"Brasil",image_url:"https://images.unsplash.com/photo-1585208798174-6cedd86e8b9d?auto=format&fit=crop&w=900&q=80",likes_count:248},
 {id:"demo2",title:"Praias do Brasil",category:"Viagens",image_url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",likes_count:421},
 {id:"demo3",title:"Arquitetura brasileira",category:"Arquitetura",image_url:"https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",likes_count:187},
 {id:"demo4",title:"Café brasileiro",category:"Comida",image_url:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",likes_count:96}
];

export default function Home(){
 const sb=supabaseBrowser();
 const [user,setUser]=useState(null),[pins,setPins]=useState(demo),[q,setQ]=useState(""),[tab,setTab]=useState("inicio");
 const [auth,setAuth]=useState(false),[register,setRegister]=useState(false),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[name,setName]=useState("");
 const [newPin,setNewPin]=useState(false),[title,setTitle]=useState(""),[url,setUrl]=useState(""),[category,setCategory]=useState("Brasil"),[msg,setMsg]=useState("");

 useEffect(()=>{sb.auth.getSession().then(({data})=>setUser(data.session?.user||null));const {data}=sb.auth.onAuthStateChange((_e,s)=>setUser(s?.user||null));return()=>data.subscription.unsubscribe()},[]);
 useEffect(()=>{loadPins()},[]);
 async function loadPins(){const {data,error}=await sb.from("pins").select("*").order("created_at",{ascending:false}).limit(60);if(!error&&data?.length)setPins(data)}
 async function doAuth(e){e.preventDefault();setMsg("");let r;
   if(register) r=await sb.auth.signUp({email,password,options:{data:{display_name:name}}});
   else r=await sb.auth.signInWithPassword({email,password});
   if(r.error)setMsg(r.error.message);else {setAuth(false);setMsg(register?"Conta criada! Verifique seu e-mail se solicitado.":"Bem-vindo ao PinBrasil!")}
 }
 async function logout(){await sb.auth.signOut();setUser(null)}
 async function createPin(e){e.preventDefault();if(!user){setAuth(true);return}
   const {error}=await sb.from("pins").insert({title,image_url:url,category,user_id:user.id});
   if(error)setMsg(error.message);else {setNewPin(false);setTitle("");setUrl("");loadPins()}
 }
 async function like(pin){if(!user){setAuth(true);return} await sb.from("likes").upsert({user_id:user.id,pin_id:pin.id});setPins(p=>p.map(x=>x.id===pin.id?{...x,likes_count:(x.likes_count||0)+1}:x))}
 const shown=pins.filter(p=>(p.title||"").toLowerCase().includes(q.toLowerCase())||(p.category||"").toLowerCase().includes(q.toLowerCase()));
 return <main>
  <header><div className="brand">📌 <b>PinBrasil</b></div><div className="search"><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Pesquisar ideias..."/></div><div className="actions">
   {user?<><button className="avatar"><UserCircle/> {user.user_metadata?.display_name||"Perfil"}</button><button onClick={logout} title="Sair"><LogOut/></button></>:<button className="loginBtn" onClick={()=>setAuth(true)}><LogIn/> Entrar</button>}
   <button className="create" onClick={()=>setNewPin(true)}><Plus/> Criar</button>
  </div></header>
  <nav className="cats">{["Tudo","Brasil","Viagens","Arquitetura","Comida","Moda","Natureza"].map(c=><button className={tab===c?"active":""} onClick={()=>setTab(c)} key={c}>{c}</button>)}</nav>
  <section className="hero"><div><span>🇧🇷</span><h1>Ideias que têm a cara do Brasil.</h1><p>Descubra, salve e compartilhe inspirações.</p></div><button onClick={()=>setNewPin(true)}><ImagePlus/> Publicar Pin</button></section>
  <section className="grid">{shown.map(p=><article className="card" key={p.id}><img src={p.image_url}/><div className="cardbody"><div><b>{p.title}</b><small>{p.category}</small></div><div className="icons"><button onClick={()=>like(p)}><Heart size={19}/> {p.likes_count||0}</button><button><MessageCircle size={19}/></button><button><Bookmark size={19}/></button></div></div></article>)}</section>
  <div className="mobileNav"><button onClick={()=>setTab("inicio")}>⌂<span>Início</span></button><button onClick={()=>setNewPin(true)}><Plus/><span>Criar</span></button><button onClick={()=>setAuth(true)}><UserCircle/><span>Perfil</span></button></div>

  {auth&&<div className="overlay"><form className="modal" onSubmit={doAuth}><button type="button" className="close" onClick={()=>setAuth(false)}>×</button><h2>{register?"Criar conta":"Entrar no PinBrasil"}</h2>{register&&<input required placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)}/>}<input required type="email" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)}/><input required minLength="6" type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary">{register?"Cadastrar":"Entrar"}</button>{msg&&<p className="msg">{msg}</p>}<button type="button" className="link" onClick={()=>setRegister(!register)}>{register?"Já tenho conta":"Ainda não tenho conta"}</button></form></div>}
  {newPin&&<div className="overlay"><form className="modal" onSubmit={createPin}><button type="button" className="close" onClick={()=>setNewPin(false)}>×</button><h2>📌 Criar Pin</h2><input required placeholder="Título do Pin" value={title} onChange={e=>setTitle(e.target.value)}/><input required type="url" placeholder="URL da imagem" value={url} onChange={e=>setUrl(e.target.value)}/><select value={category} onChange={e=>setCategory(e.target.value)}>{["Brasil","Viagens","Arquitetura","Comida","Moda","Natureza"].map(x=><option key={x}>{x}</option>)}</select><button className="primary">Publicar</button><p className="msg">Para publicar de verdade, entre na sua conta.</p></form></div>}
 </main>
}