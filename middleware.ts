import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";
type CookieUpdate={name:string;value:string;options?:any};
export async function middleware(request:NextRequest){
 let response=NextResponse.next({request});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key){
  if(request.nextUrl.pathname.startsWith("/dashboard")){const target=request.nextUrl.clone();target.pathname="/login";target.searchParams.set("notice","configure-supabase");return NextResponse.redirect(target);}
  return response;
 }
 const supabase=createServerClient(url,key,{cookies:{
  getAll:()=>request.cookies.getAll(),
  setAll(items:CookieUpdate[]){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options));}
 }});
 const {data:{user}}=await supabase.auth.getUser();
 if(request.nextUrl.pathname.startsWith("/dashboard")&&!user){const target=request.nextUrl.clone();target.pathname="/login";target.searchParams.set("next","/dashboard");return NextResponse.redirect(target);}
 if((request.nextUrl.pathname==="/login"||request.nextUrl.pathname==="/signup")&&user){const target=request.nextUrl.clone();target.pathname="/dashboard";return NextResponse.redirect(target);}
 return response;
}
export const config={matcher:["/dashboard/:path*","/login","/signup"]};