import {render} from "preact"
import {App} from "~/app"
import "~/main.css"
import {fetchSession} from "./session"

render(<App />, document.getElementById("root")!)

fetchSession()
