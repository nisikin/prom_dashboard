from zai import ZhipuAiClient
from core.config import settings
import json


class Client:
    def __init__(self, model: str = "glm-4-air-250414", sys_prompt: str = ""):
        self.client = ZhipuAiClient(api_key=settings.ZAI_API_KEY)
        self.model = model
        self.messages = []
        if sys_prompt != "":
            self.messages.append({"role": "system", "content": sys_prompt})

    def use_tools(self, tools: list, user_prompt: str) -> list[list]:
        self.messages.append({"role": "user", "content": user_prompt})
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.messages,
            tools=tools,
            tool_choice="auto",
        )

        self.messages.append({"role": "assistant", "content": response.choices[0].message.content})

        res = []

        if response.choices[0].message.tool_calls:
            for tool_call in response.choices[0].message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                res.append([function_name, function_args, tool_call.id])

        return res

    def chat(self, user_prompt: str) -> str:
        self.messages.append({"role": "user", "content": user_prompt})

        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.messages,
        )

        self.messages.append({"role": "assistant", "content": response.choices[0].message.content})

        return response.choices[0].message.content