from LLM.tools import get_all_metrics, tools
from LLM.models.glm import Client
import json

system_prompt = """
You are a Prometheus expert.
You can only use metrics returned by the tools.
Rules:
- Counter types must use rate()
- Gauges must not use rate()
- The output must be PromQL and must not contain any explanatory text.
"""

def generate_PromQL(user_prompt: str) -> str:
    client = Client(sys_prompt=system_prompt)
    tool_calls = client.use_tools(tools, user_prompt)
    if tool_calls:
        for function_name, function_args, tool_call_id in tool_calls:
            if function_name == "get_all_metrics":
                metrics = get_all_metrics()
                client.messages.append({"role": "tool", "content": json.dumps(metrics), "tool_call_id": tool_call_id})
    promql = client.chat(user_prompt)
    
    return promql
