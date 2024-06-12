import {type MethodResult, App} from "reproca/app";
const app = new App(import.meta.env.VITE_BACKEND);
export async function create_comment(parameters: CreateCommentParameters):Promise<MethodResult<((number)|(null))>>{return await app.method('create_comment', parameters);}
export async function upvote_comment(parameters: UpvoteCommentParameters):Promise<MethodResult<null>>{return await app.method('upvote_comment', parameters);}
export async function downvote_comment(parameters: DownvoteCommentParameters):Promise<MethodResult<null>>{return await app.method('downvote_comment', parameters);}
export async function get_root_feed(parameters: GetRootFeedParameters = {}):Promise<MethodResult<(Post)[]>>{return await app.method('get_root_feed', parameters);}
export async function get_board_feed(parameters: GetBoardFeedParameters):Promise<MethodResult<(Post)[]>>{return await app.method('get_board_feed', parameters);}
export async function hello(parameters: HelloParameters = {}):Promise<MethodResult<string>>{return await app.method('hello', parameters);}
export async function create_post(parameters: CreatePostParameters):Promise<MethodResult<((number)|(null))>>{return await app.method('create_post', parameters);}
export async function upvote_post(parameters: UpvotePostParameters):Promise<MethodResult<null>>{return await app.method('upvote_post', parameters);}
export async function downvote_post(parameters: DownvotePostParameters):Promise<MethodResult<null>>{return await app.method('downvote_post', parameters);}
export async function get_post(parameters: GetPostParameters):Promise<MethodResult<((GetPostValue)|(null))>>{return await app.method('get_post', parameters);}
export async function create_reply(parameters: CreateReplyParameters):Promise<MethodResult<((number)|(null))>>{return await app.method('create_reply', parameters);}
export async function upvote_reply(parameters: UpvoteReplyParameters):Promise<MethodResult<null>>{return await app.method('upvote_reply', parameters);}
export async function downvote_reply(parameters: DownvoteReplyParameters):Promise<MethodResult<null>>{return await app.method('downvote_reply', parameters);}
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
export async function get_user(parameters: GetUserParameters):Promise<MethodResult<((User)|(null))>>{return await app.method('get_user', parameters);}
export interface GetBoardFeedParameters{board:string;}export interface DownvoteCommentParameters{comment_id:number;}export interface VerifyParameters{verification_token:string;}export interface DownvotePostParameters{post_id:number;}export interface LoginParameters{username:string;password:string;}export interface UpdateEmailParameters{username:string;password:string;email:string;}export enum LoginResult{OK='ok',INCORRECT_PASSWORD='incorrect_password',VERIFICATION_REQUIRED='verification_required',}export interface GetPostParameters{post_id:number;}export type Result<T,E>=((Ok<T>)|(Err<E>));export interface Session{id:number;username:string;email:string;avatar:string;status:string;created_at:number;last_login_at:number;role:string;}export interface UpdatePasswordParameters{reset_token:string;password:string;}export interface UpvoteCommentParameters{comment_id:number;}export interface GetRootFeedParameters{}export interface GetSessionParameters{}export interface GetUserParameters{username:string;}export interface UpvotePostParameters{post_id:number;}export interface DownvoteReplyParameters{reply_id:number;}export interface UpdateStatusParameters{status:string;}export interface HelloParameters{}export interface User{avatar:string;status:string;created_at:number;last_login_at:number;karma:number;posts:(Post)[];}export interface RegisterParameters{username:string;password:string;email:string;}export enum RegisterError{INVALID_FORMAT='invalid_format',USERNAME_TAKEN='username_taken',EMAIL_TAKEN='email_taken',}export interface GetPostValue{post:Post;comments:(Comment)[];}export interface LogoutParameters{}export interface ResetPasswordParameters{username?:string;email?:string;}export interface CreateReplyParameters{comment_id:number;content:string;}export interface Post{id:number;author_username:string;author_avatar:string;author_status:string;vote:Vote;score:number;board:string;content:string;created_at:number;comment_count:number;}export interface CreateCommentParameters{post_id:number;content:string;}export interface CreatePostParameters{board:string;content:string;}export interface UpdateAvatarParameters{avatar:string;}export interface UpvoteReplyParameters{reply_id:number;}export enum Vote{UPVOTE='upvote',DOWNVOTE='downvote',NONE='none',}export interface Comment{id:number;author_username:string;author_avatar:string;author_status:string;vote:Vote;score:number;content:string;created_at:number;reply_count:number;replies:(Reply)[];}export interface Ok<T>{value:T;ok:true;}export interface Err<T>{value:T;ok:false;}export interface Reply{id:number;author_username:string;author_avatar:string;author_status:string;vote:Vote;score:number;content:string;created_at:number;}