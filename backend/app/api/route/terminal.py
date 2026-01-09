from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import paramiko
import asyncio

router = APIRouter(prefix="/terminal", tags=["terminal"])


class SSHConnection:
    def __init__(self, host: str, port: int, username: str, password: str):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.client = None
        self.channel = None

    async def connect(self):
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.connect(
                    hostname=self.host,
                    port=self.port,
                    username=self.username,
                    password=self.password,
                    timeout=10,
                ),
            )

            self.channel = self.client.invoke_shell()
            self.channel.setblocking(0)
            return True
        except Exception as e:
            print(f"SSH connection error: {e}")
            return False

    def resize_pty(self, cols: int, rows: int):
        if self.channel:
            self.channel.resize_pty(width=cols, height=rows)

    def send(self, data: str):
        if self.channel:
            self.channel.send(data)

    def recv(self, size: int = 4096) -> Optional[bytes]:
        if self.channel:
            try:
                return self.channel.recv(size)
            except Exception:
                return None
        return None

    def close(self):
        if self.channel:
            self.channel.close()
        if self.client:
            self.client.close()


@router.websocket("/ws")
async def websocket_terminal(
    websocket: WebSocket,
    host: str = Query(...),
    port: int = Query(22),
    username: str = Query(...),
    password: str = Query(...),
):
    await websocket.accept()

    ssh = SSHConnection(host, port, username, password)

    try:
        if not await ssh.connect():
            await websocket.send_text(
                "\x1b[1;31mFailed to connect to SSH server\x1b[0m\r\n"
            )
            await websocket.send_text(
                f"Please check your credentials and network connection.\r\n"
            )
            await websocket.close()
            return

        await websocket.send_text(f"\x1b[1;32mConnected to {host}:{port}\x1b[0m\r\n")

        async def forward_ssh_to_websocket():
            while True:
                try:
                    data = ssh.recv()
                    if data:
                        await websocket.send_text(data.decode("utf-8", errors="ignore"))
                    else:
                        await asyncio.sleep(0.01)
                except Exception as e:
                    print(f"Forward error: {e}")
                    break

        forward_task = asyncio.create_task(forward_ssh_to_websocket())

        try:
            while True:
                data = await websocket.receive_text()
                ssh.send(data)
        except WebSocketDisconnect:
            print("WebSocket disconnected")
        except Exception as e:
            print(f"WebSocket error: {e}")
        finally:
            forward_task.cancel()
            ssh.close()

    except Exception as e:
        print(f"Terminal error: {e}")
        await websocket.send_text(f"\x1b[1;31mError: {str(e)}\x1b[0m\r\n")
        await websocket.close()
