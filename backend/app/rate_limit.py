import time
import asyncio
from typing import Dict, Tuple

class RateLimiter:
    def __init__(self, requests_per_window: int = 60, window_size_seconds: int = 60):
        self.requests_per_window = requests_per_window
        self.window_size_seconds = window_size_seconds
        # key: identifier, value: tuple of (window_start_time, request_count)
        self.clients: Dict[str, Tuple[float, int]] = {}
        self.lock = asyncio.Lock()

    async def is_rate_limited(self, identifier: str) -> bool:
        async with self.lock:
            current_time = time.time()
            if identifier not in self.clients:
                self.clients[identifier] = (current_time, 1)
                return False
            
            window_start, count = self.clients[identifier]
            if current_time - window_start >= self.window_size_seconds:
                # Reset window
                self.clients[identifier] = (current_time, 1)
                return False
            
            if count >= self.requests_per_window:
                return True
            
            self.clients[identifier] = (window_start, count + 1)
            return False

    async def cleanup(self):
        """Cleanup stale entries to prevent memory leak"""
        async with self.lock:
            current_time = time.time()
            keys_to_remove = []
            for identifier, (window_start, _) in self.clients.items():
                if current_time - window_start >= self.window_size_seconds:
                    keys_to_remove.append(identifier)
            for identifier in keys_to_remove:
                del self.clients[identifier]

# Instantiate limiters
api_rate_limiter = RateLimiter(requests_per_window=30, window_size_seconds=60)
ws_message_limiter = RateLimiter(requests_per_window=10, window_size_seconds=1)  # 10 msgs per sec per socket
