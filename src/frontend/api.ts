import {type MethodResult, App} from "reproca/app";
const app = new App(import.meta.env.VITE_BACKEND);
export async function hello(parameters: HelloParameters = {}):Promise<MethodResult<string>>{return await app.method('hello', parameters);}
export async function verify(parameters: VerifyParameters):Promise<MethodResult<null>>{return await app.method('verify', parameters);}
export async function register(parameters: RegisterParameters):Promise<MethodResult<Result<number,RegisterError>>>{return await app.method('register', parameters);}
export async function login(parameters: LoginParameters):Promise<MethodResult<LoginResult>>{return await app.method('login', parameters);}
export async function logout(parameters: LogoutParameters = {}):Promise<MethodResult<null>>{return await app.method('logout', parameters);}
/** 
    Returns True if email was updated, False if either username or password was
    incorrect or account does not exist.
     */
export async function update_email(parameters: UpdateEmailParameters):Promise<MethodResult<boolean>>{return await app.method('update_email', parameters);}
export async function reset_password(parameters: ResetPasswordParameters):Promise<MethodResult<null>>{return await app.method('reset_password', parameters);}
export async function update_password(parameters: UpdatePasswordParameters):Promise<MethodResult<null>>{return await app.method('update_password', parameters);}
export async function update_avatar(parameters: UpdateAvatarParameters):Promise<MethodResult<null>>{return await app.method('update_avatar', parameters);}
export async function update_status(parameters: UpdateStatusParameters):Promise<MethodResult<null>>{return await app.method('update_status', parameters);}
export async function get_session(parameters: GetSessionParameters = {}):Promise<MethodResult<((Session)|(null))>>{return await app.method('get_session', parameters);}
export interface LoginParameters{username:string;password:string;}export interface ResetPasswordParameters{username?:string;email?:string;}export interface GetSessionParameters{}export interface RegisterParameters{username:string;password:string;email:string;}export enum RegisterError{INVALID_FORMAT='invalid_format',USERNAME_TAKEN='username_taken',EMAIL_TAKEN='email_taken',}export interface UpdatePasswordParameters{reset_token:string;password:string;}export interface LogoutParameters{}export interface UpdateEmailParameters{username:string;password:string;email:string;}export interface UpdateAvatarParameters{avatar:string;}export interface HelloParameters{}export enum LoginResult{OK='ok',INCORRECT_PASSWORD='incorrect_password',VERIFICATION_REQUIRED='verification_required',}export interface Session{id:number;username:string;email:string;avatar:string;status:string;created_at:number;last_login_at:number;role:string;}export type Result<T,E>=((Ok<T>)|(Err<E>));export interface UpdateStatusParameters{status:string;}export interface VerifyParameters{verification_token:string;}export interface Ok<T>{value:T;ok:true;}export interface Err<T>{value:T;ok:false;}