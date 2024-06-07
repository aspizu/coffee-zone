import {type MethodResult, App} from "reproca/app";
const app = new App(import.meta.env.VITE_API);
export async function hello(parameters: HelloParameters = {}):Promise<MethodResult<string>>{return await app.method('hello', parameters);}
export interface HelloParameters{}