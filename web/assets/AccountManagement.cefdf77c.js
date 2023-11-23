import{r as m}from"./request.60bf0c1b.js";import{_ as X,b as d,w as s,f as l,o as c,a as e,g as N,d as r,c as b,r as k,F as w,e as g,t as C}from"./index.ee0f6373.js";const q={name:"AccountManagement",data(){return{data:[],pages:0,page:1,size:5,settingsModel:!1,optionsModel:!1,item:{},channelList:[],newPassword:"",checkNewPassword:"",imagePath:"",buffer:!1,toasts:[]}},mounted(){this.checkJWT()},methods:{checkJWT(){if(!this.$store.state.jwt){this.toasts.push({title:"Error",content:"\u767B\u5165\u91D1\u9470\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165!"}),this.$router.push("/dashboard");return}m({method:"POST",url:"/auth/checkJWT",headers:{authorization:this.$store.state.jwt}}).then(a=>{a.data.status?this.init():(this.toasts.push({title:"Error",content:"\u767B\u5165\u91D1\u9470\u5DF2\u904E\u671F\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165!"}),this.$router.push("/dashboard"))}).catch(a=>{console.log(a)})},async init(){this.pages=0,this.page=1,this.size=5,await this.getChannelList(),m({method:"GET",url:"/account/"}).then(a=>{let o=a.data;switch(o.status){case 1:let i=[];o.data.length>=25?this.size=15:this.size=5,o.data.forEach((u,t)=>{u.index=t+1,i.push(u)}),this.data=i,this.data.length/this.size>1?this.pages=Math.ceil(this.data.length/this.size):this.pages=1;break;case 0:this.toasts.push({title:"Error",content:"\u7CFB\u7D71\u932F\u8AA4\uFF0C\u8ACB\u8207\u7BA1\u7406\u8005\u806F\u7E6B"});break;case 102:this.toasts.push({title:"Error",content:"token\u932F\u8AA4\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165"});break}}).catch(a=>{console.log(a)})},getChannelList(){new Promise((a,o)=>{this.channelList=[],m({method:"GET",url:"/channel"}).then(i=>{let u=i.data;switch(u.status){case 1:u.data.forEach((t,h)=>{this.channelList.push({label:t.channelName,value:t.id})}),a();break;case 0:this.toasts.push({title:"Error",content:"\u7CFB\u7D71\u932F\u8AA4\uFF0C\u8ACB\u8207\u7BA1\u7406\u8005\u806F\u7E6B"}),o();break}}).catch(i=>{console.log(i),o()})})},showSettingModel(a){this.item=a,this.settingsModel=!0},showOptionsModel(a){this.item=a,this.item.bind=this.item.bind.split(";");let o=[];this.channelList.forEach((i,u)=>{o.push({label:i.label,value:i.value,checked:!1})}),this.item.bind.forEach((i,u)=>{o.forEach((t,h)=>{i==t.value&&(t.checked=!0)})}),this.item.bind=o,this.optionsModel=!0},resetPassword(){if(this.buffer)return;this.buffer=!0;const a=new RegExp("^((?=.{8,12}$)(?=.*[a-z])(?=.*[A-Z]))");if(this.item.account===""||this.newPassword===""||this.checkNewPassword===""){this.toasts.push({title:"Error",content:"\u8ACB\u78BA\u5BE6\u586B\u5165\u5E33\u865F\u5BC6\u78BC!"}),this.buffer=!1;return}if(this.newPassword!==this.checkNewPassword){this.toasts.push({title:"Error",content:"\u65B0\u5BC6\u78BC\u8207\u78BA\u8A8D\u5BC6\u78BC\u4E0D\u76F8\u7B26!"}),this.buffer=!1;return}if(!a.test(this.newPassword)){this.toasts.push({title:"Error",content:"\u5BC6\u78BC\u683C\u5F0F\u932F\u8AA4\uFF0C\u8ACB\u78BA\u8A8D\u5F8C\u518D\u8A2D\u5B9A!"}),this.buffer=!1;return}const o={account:this.item.account,password:this.newPassword};m({method:"PUT",url:"/line_service",data:o}).then(i=>{switch(i.data.status){case 1:this.toasts.push({title:"Success",content:"\u66F4\u65B0\u5BC6\u78BC\u6210\u529F!"}),this.settingsModel=!1,this.checkJWT();break;case 0:this.toasts.push({title:"Error",content:"\u7CFB\u7D71\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u8207\u7BA1\u7406\u8005\u806F\u7E6B!"}),this.settingsModel=!1,this.checkJWT();break;case 101:this.toasts.push({title:"Error",content:"\u8CC7\u6599\u683C\u5F0F\u932F\u8AA4\uFF0C\u8ACB\u8207\u7BA1\u7406\u8005\u806F\u7E6B!"}),this.settingsModel=!1,this.checkJWT();break;case 102:this.toasts.push({title:"Error",content:"\u5E33\u865F\u4E0D\u5B58\u5728\uFF0C\u8ACB\u91CD\u65B0\u64CD\u4F5C!"}),this.settingsModel=!1,this.checkJWT();break;case 103:this.toasts.push({title:"Error",content:"\u8ACB\u52FF\u4F7F\u7528\u6700\u8FD1\u4E09\u6B21\u4F7F\u7528\u904E\u7684\u5BC6\u78BC!"}),this.newPassword="",this.checkNewPassword="";break;case 110:this.toasts.push({title:"Error",content:"\u8CC7\u6599\u4E2D\u5B58\u5728\u9055\u898F\u7684\u7279\u6B8A\u7B26\u865F!"}),this.newPassword="",this.checkNewPassword="";break}this.buffer=!1}).catch(i=>{this.toasts.push({title:"Error",content:"\u7CFB\u7D71\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u8207\u7BA1\u7406\u8005\u806F\u7E6B!"}),this.resetPasswordModel=!1,this.buffer=!1,this.checkJWT()})},updateBind(){if(this.buffer)return;this.buffer=!0;let a=[];if(this.item.bind.forEach((i,u)=>{i.checked&&a.push(i.value)}),a.length===0){this.toasts.push({title:"Error",content:"\u8ACB\u81F3\u5C11\u9078\u64C7\u4E00\u500B!"}),this.buffer=!1;return}a=a.join(";");const o={token:this.item.token,bind:a};m({method:"PUT",url:"/account/bind",data:o,headers:{authorization:this.$store.state.jwt}}).then(i=>{switch(i.data.status){case 1:this.toasts.push({title:"Success",content:"\u7D81\u5B9A\u5B8C\u6210!"}),this.optionsModel=!1,this.buffer=!1,this.checkJWT();break;case 0:this.toasts.push({title:"Error",content:"\u7CFB\u7D71\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u8207\u7BA1\u7406\u8005\u806F\u7E6B!"}),this.optionsModel=!1,this.buffer=!1,this.checkJWT();break;case 101:this.toasts.push({title:"Error",content:"\u8CC7\u6599\u683C\u5F0F\u932F\u8AA4\uFF0C\u8ACB\u8207\u7BA1\u7406\u8005\u806F\u7E6B!"}),this.optionsModel=!1,this.buffer=!1,this.checkJWT();break;case 102:this.toasts.push({title:"Error",content:"Token\u4E0D\u5B58\u5728\uFF0C\u8ACB\u91CD\u65B0\u64CD\u4F5C!"}),this.optionsModel=!1,this.buffer=!1,this.checkJWT();break;case 110:this.toasts.push({title:"Error",content:"\u8CC7\u6599\u4E2D\u5B58\u5728\u9055\u898F\u7684\u7279\u6B8A\u7B26\u865F!"}),this.optionsModel=!1,this.buffer=!1,this.checkJWT();break;case 121:this.toasts.push({title:"Error",content:"JWT\u932F\u8AA4\uFF0C\u8ACB\u91CD\u65B0\u767B\u5165!"}),this.optionsModel=!1,this.buffer=!1,this.checkJWT();break}}).catch(i=>{this.toasts.push({title:"Error",content:"\u7CFB\u7D71\u767C\u751F\u932F\u8AA4\uFF0C\u8ACB\u8207\u7BA1\u7406\u8005\u806F\u7E6B!"}),this.optionsModel=!1,this.buffer=!1,this.checkJWT()})}}},Z={class:"me-auto fw-bold"};function K(a,o,i,u,t,h){const f=l("CIcon"),p=l("CButton"),T=l("CTableHeaderCell"),y=l("CTableRow"),W=l("CTableHead"),M=l("CTableDataCell"),z=l("CTableBody"),F=l("CTable"),L=l("CPaginationItem"),U=l("CPagination"),H=l("CCardBody"),v=l("CModalTitle"),x=l("CModalHeader"),P=l("CFormLabel"),E=l("CFormInput"),B=l("CModalBody"),V=l("CModalFooter"),J=l("CModal"),A=l("CFormCheck"),R=l("CToastHeader"),I=l("CToastBody"),S=l("CToast"),j=l("CToaster"),D=l("CCard"),O=l("CRow"),G=l("CContainer");return c(),d(G,null,{default:s(()=>[e(O,null,{default:s(()=>[e(D,null,{default:s(()=>[e(H,null,{default:s(()=>[N("h2",null,[r("Account Management "),e(p,{onClick:o[0]||(o[0]=n=>h.init())},{default:s(()=>[e(f,{name:"cil-sync"}),r(" Update ")]),_:1})]),e(F,{align:"middle",responsive:""},{default:s(()=>[e(W,null,{default:s(()=>[e(y,null,{default:s(()=>[e(T,{scope:"col",class:"w-25"},{default:s(()=>[r("Name")]),_:1}),e(T,{scope:"col",class:"w-25"},{default:s(()=>[r("Account")]),_:1}),e(T,{scope:"col",class:"w-25"})]),_:1})]),_:1}),e(z,null,{default:s(()=>[(c(!0),b(w,null,k(t.data,n=>(c(),d(y,{key:n.index},{default:s(()=>[n.index<=t.page*t.size&&n.index>(t.page-1)*t.size?(c(),d(M,{key:0},{default:s(()=>[r(C(n.name),1)]),_:2},1024)):g("",!0),n.index<=t.page*t.size&&n.index>(t.page-1)*t.size?(c(),d(M,{key:1},{default:s(()=>[r(C(n.account),1)]),_:2},1024)):g("",!0),n.index<=t.page*t.size&&n.index>(t.page-1)*t.size?(c(),d(M,{key:2},{default:s(()=>[e(p,{onClick:_=>h.showSettingModel(n)},{default:s(()=>[e(f,{name:"cil-sync"})]),_:2},1032,["onClick"]),e(p,{onClick:_=>h.showOptionsModel(n)},{default:s(()=>[e(f,{name:"cil-settings"})]),_:2},1032,["onClick"])]),_:2},1024)):g("",!0)]),_:2},1024))),128))]),_:1})]),_:1}),t.data.length>0?(c(),d(U,{key:0,align:"end","aria-label":"Page navigation example"},{default:s(()=>[(c(!0),b(w,null,k(t.pages,n=>(c(),d(L,{key:n.index,active:t.page===n,onClick:_=>t.page=n},{default:s(()=>[r(C(n),1)]),_:2},1032,["active","onClick"]))),128))]),_:1})):g("",!0)]),_:1}),e(J,{alignment:"center",visible:t.settingsModel,onClose:o[6]||(o[6]=()=>{t.settingsModel=!1})},{default:s(()=>[e(x,null,{default:s(()=>[e(v,null,{default:s(()=>[r("Reset Password")]),_:1})]),_:1}),e(B,null,{default:s(()=>[e(P,null,{default:s(()=>[r("Account")]),_:1}),e(E,{id:"tagetAccount",modelValue:t.item.account,"onUpdate:modelValue":o[1]||(o[1]=n=>t.item.account=n),disabled:""},null,8,["modelValue"]),e(P,null,{default:s(()=>[r("New Password")]),_:1}),e(E,{id:"newPassword",modelValue:t.newPassword,"onUpdate:modelValue":o[2]||(o[2]=n=>t.newPassword=n),type:"password"},null,8,["modelValue"]),e(P,null,{default:s(()=>[r("Check New Password")]),_:1}),e(E,{id:"checkNewPassword",modelValue:t.checkNewPassword,"onUpdate:modelValue":o[3]||(o[3]=n=>t.checkNewPassword=n),type:"password"},null,8,["modelValue"])]),_:1}),e(V,null,{default:s(()=>[e(p,{color:"info",onClick:o[4]||(o[4]=n=>h.resetPassword()),disabled:t.buffer},{default:s(()=>[e(f,{name:"cil-sync"}),r(" Reset")]),_:1},8,["disabled"]),e(p,{color:"secondary",onClick:o[5]||(o[5]=()=>{t.settingsModel=!1})},{default:s(()=>[e(f,{name:"cil-X"}),r(" Close ")]),_:1})]),_:1})]),_:1},8,["visible"]),e(J,{alignment:"center",visible:t.optionsModel,onClose:o[9]||(o[9]=()=>{t.optionsModel=!1})},{default:s(()=>[e(x,null,{default:s(()=>[e(v,null,{default:s(()=>[r(C(t.item.name)+" : \u7D81\u5B9A",1)]),_:1})]),_:1}),e(B,null,{default:s(()=>[(c(!0),b(w,null,k(t.item.bind,n=>(c(),d(A,{key:n.value,modelValue:n.checked,"onUpdate:modelValue":_=>n.checked=_,value:n.value,label:n.label},null,8,["modelValue","onUpdate:modelValue","value","label"]))),128))]),_:1}),e(V,null,{default:s(()=>[e(p,{color:"info",onClick:o[7]||(o[7]=n=>h.updateBind()),disabled:t.buffer},{default:s(()=>[e(f,{name:"cil-settings"}),r(" Update")]),_:1},8,["disabled"]),e(p,{color:"secondary",onClick:o[8]||(o[8]=()=>{t.optionsModel=!1})},{default:s(()=>[e(f,{name:"cil-X"}),r(" Close ")]),_:1})]),_:1})]),_:1},8,["visible"]),e(j,{placement:"top-end"},{default:s(()=>[(c(!0),b(w,null,k(t.toasts,n=>(c(),d(S,{key:n.index,delay:3e3},{default:s(()=>[e(R,{closeButton:""},{default:s(()=>[N("span",Z,C(n.title),1)]),_:2},1024),e(I,null,{default:s(()=>[r(C(n.content),1)]),_:2},1024)]),_:2},1024))),128))]),_:1})]),_:1})]),_:1})]),_:1})}const $=X(q,[["render",K]]);export{$ as default};