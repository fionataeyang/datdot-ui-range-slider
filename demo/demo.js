const bel = require('bel')
const csjs = require('csjs-inject')
const rangeSlider = require('..')
const path = require('path')
const filename = path.basename(__filename)
const { getcpu, getram } = require('../src/node_modules/getSystemInfo')
const domlog = require('ui-domlog')

function demoComponent() {
    let recipients = []
    const cpu = rangeSlider({page: 'JOBS', name: 'cpu', label: 'CPU', info: getcpu(), range: { min:0, max: 100 }, setValue: 8}, protocol('cpu') )
    const ram = rangeSlider({page: 'JOBS', name: 'ram', label: 'RAM', info: getram(), range: { min:0, max: 100 }, setValue: 27}, protocol('ram') )
    
    const content = bel`
    <div class=${css.content}>
        ${cpu} ${ram}
    </div>
    `
    // show logs
    let terminal = bel`<div class=${css.terminal}></div>`
    // container
    const container = wrap(content, terminal)
    return container

    function wrap (content) {
        const container = bel`
        <div class=${css.wrap}>
            <section class=${css.container}>
                ${content}
            </section>
            ${terminal}
        </div>
        `
        return container
    }

    /*************************
    * ------- Actions --------
    *************************/

    /*************************
    * ------- Protocol --------
    *************************/
    function protocol (name) {
        return send => {
            recipients[name] = send
            return receive
        }
    }

    /*************************
    * ------ Receivers -------
    *************************/
    function receive (message) {
        const { page, from, flow, type, action, body, filename, line } = message
        showLog(message)
    }

    // keep the scroll on bottom when the log displayed on the terminal
    function showLog (message) { 
        sendMessage(message)
        .then( log => {
            terminal.append(log)
            terminal.scrollTop = terminal.scrollHeight
        }
    )}
   /*********************************
    * ------ Promise() Element -------
    *********************************/
    async function sendMessage (message) {
        return await new Promise( (resolve, reject) => {
            if (message === undefined) reject('no message import')
            const log = domlog(message)
            return resolve(log)
        }).catch( err => { throw new Error(err) } )
    }
}

const css = csjs`
body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    background-color: #F2F2F2;
    height: 100%;
}
.wrap {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 75vh 25vh;
}
.container {
    padding: 25px;
}
.container > div {
    margin-bottom: 25px;
}
.terminal {
    background-color: #212121;
    color: #f2f2f2;
    font-size: 13px;
    overflow-y: auto;
}
.log:last-child {
    color: #FFF500;
    font-weight: bold;
    
}
.log {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 2px 12px 0 0;
    border-bottom: 1px solid #333;
}
.output {

}
.badge {
    background-color: #333;
    padding: 6px;
    margin-right: 10px;
    font-size: 14px;
    display: inline-block;
}
.code-line {

}
`

document.body.append( demoComponent() )