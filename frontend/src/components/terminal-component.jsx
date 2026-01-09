"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import "@xterm/xterm/css/xterm.css"
import { API_URL } from "@/lib/config"

const Terminal = dynamic(() => import("xterm").then(mod => mod.Terminal), { ssr: false })
const FitAddon = dynamic(() => import("xterm-addon-fit").then(mod => mod.FitAddon), { ssr: false })
const WebLinksAddon = dynamic(() => import("xterm-addon-web-links").then(mod => mod.WebLinksAddon), { ssr: false })

export function TerminalComponent() {
    const [Terminal, setTerminal] = React.useState(null)
    const [FitAddon, setFitAddon] = React.useState(null)
    const [WebLinksAddon, setWebLinksAddon] = React.useState(null)
    const terminalRef = React.useRef(null)
    const xtermRef = React.useRef(null)
    const fitAddonRef = React.useRef(null)
    const [isConnected, setIsConnected] = React.useState(false)
    const [connectionError, setConnectionError] = React.useState("")
    const [host, setHost] = React.useState("")
    const [port, setPort] = React.useState("22")
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [wsUrl, setWsUrl] = React.useState(API_URL + "/terminal/ws")
    const [ws, setWs] = React.useState(null)

    const [terminalModule, setTerminalModule] = React.useState(null)
    const [fitAddonModule, setFitAddonModule] = React.useState(null)
    const [webLinksAddonModule, setWebLinksAddonModule] = React.useState(null)

    React.useEffect(() => {
        // 动态加载 xterm.js 模块
        Promise.all([
            import("xterm"),
            import("xterm-addon-fit"),
            import("xterm-addon-web-links")
        ]).then(([xtermModule, fitModule, webLinksModule]) => {
            setTerminalModule(xtermModule)
            setFitAddonModule(fitModule)
            setWebLinksAddonModule(webLinksModule)
        }).catch(error => {
            console.error("Failed to load xterm.js modules:", error)
        })
    }, [])

    React.useEffect(() => {
        if (terminalRef.current && !xtermRef.current && terminalModule && fitAddonModule && webLinksAddonModule) {
            const { Terminal } = terminalModule
            const { FitAddon } = fitAddonModule
            const { WebLinksAddon } = webLinksAddonModule
            const terminal = new Terminal({
                cursorBlink: true,
                fontSize: 14,
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                theme: {
                    background: '#1e1e1e',
                    foreground: '#d4d4d4',
                    cursor: '#ffffff',
                    selection: '#264f78',
                },
            })

            const fitAddon = new FitAddon()
            const webLinksAddon = new WebLinksAddon()

            terminal.loadAddon(fitAddon)
            terminal.loadAddon(webLinksAddon)

            terminal.open(terminalRef.current)
            fitAddon.fit()

            xtermRef.current = terminal
            fitAddonRef.current = fitAddon

            terminal.writeln('\x1b[1;34mWelcome to Web Terminal\x1b[0m')
            terminal.writeln('Please enter your connection details above to connect to a remote server.')
            terminal.writeln('')

            const handleResize = () => {
                if (fitAddonRef.current) {
                    fitAddonRef.current.fit()
                }
            }

            window.addEventListener('resize', handleResize)

            return () => {
                window.removeEventListener('resize', handleResize)
                terminal.dispose()
                xtermRef.current = null
                fitAddonRef.current = null
            }
        }
    }, [terminalModule, fitAddonModule, webLinksAddonModule])

    React.useEffect(() => {
        if (fitAddonRef.current) {
            fitAddonRef.current.fit()
        }
    }, [])

    const handleConnect = () => {
        if (!host || !username || !password) {
            setConnectionError("Please fill in all connection details")
            return
        }

        setConnectionError("")
        const terminal = xtermRef.current
        if (!terminal) {
            setConnectionError("Terminal not initialized")
            return
        }

        try {
            const fullUrl = `${wsUrl}?host=${encodeURIComponent(host)}&port=${encodeURIComponent(port)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            terminal.writeln(`\x1b[1;36mConnecting to ${host}:${port}...\x1b[0m`)

            const websocket = new WebSocket(fullUrl)

            websocket.onopen = () => {
                setIsConnected(true)
                setConnectionError("")
                terminal.writeln('\x1b[1;32mConnected to server\x1b[0m')
                terminal.writeln('')
            }

            websocket.onmessage = (event) => {
                terminal.write(event.data)
            }

            websocket.onerror = (error) => {
                const errorMsg = `Failed to connect to WebSocket server at ${wsUrl}. Please check:`
                terminal.writeln('\x1b[1;31mConnection error\x1b[0m')
                terminal.writeln(errorMsg)
                terminal.writeln('  1. WebSocket server is running')
                terminal.writeln('  2. WebSocket URL is correct')
                terminal.writeln('  3. No firewall blocking the connection')
                terminal.writeln('')
                setConnectionError(`WebSocket connection failed. Server at ${wsUrl} is not responding.`)
                console.error('WebSocket error:', error)
            }

            websocket.onclose = (event) => {
                setIsConnected(false)
                if (event.code !== 1000) {
                    terminal.writeln(`\x1b[1;33mConnection closed (code: ${event.code})\x1b[0m`)
                } else {
                    terminal.writeln('\x1b[1;33mConnection closed\x1b[0m')
                }
                setWs(null)
            }

            terminal.onData((data) => {
                if (websocket.readyState === WebSocket.OPEN) {
                    websocket.send(data)
                }
            })

            setWs(websocket)
        } catch (error) {
            terminal.writeln('\x1b[1;31mFailed to connect: ' + error.message + '\x1b[0m')
            setConnectionError(`Connection failed: ${error.message}`)
        }
    }

    const handleDisconnect = () => {
        if (ws) {
            ws.close()
        }
    }

    const handleClear = () => {
        const terminal = xtermRef.current
        if (terminal) {
            terminal.clear()
        }
    }

    return (
        <div className="flex flex-col gap-4 h-full px-4">
            <Card>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="host">Host</Label>
                            <Input
                                id="host"
                                placeholder="example.com"
                                value={host}
                                onChange={(e) => setHost(e.target.value)}
                                disabled={isConnected}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="port">Port</Label>
                            <Input
                                id="port"
                                placeholder="22"
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                disabled={isConnected}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isConnected}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isConnected}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        {!isConnected ? (
                            <Button onClick={handleConnect}>Connect</Button>
                        ) : (
                            <Button onClick={handleDisconnect} variant="destructive">Disconnect</Button>
                        )}
                        <Button onClick={handleClear} variant="outline">Clear Terminal</Button>
                    </div>
                </CardContent>
            </Card>
            <div
                ref={terminalRef}
                className="w-full h-full bg-[#1e1e1e] rounded"
                style={{ minHeight: '400px' }}
            />
        </div>
    )
}