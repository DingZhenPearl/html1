# 导入SDK，发起请求
# -*- coding: utf-8 -*-
import json

import sys
import io
from openai import OpenAI

# 设置标准输出编码为 UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


def analyze_data(data):
    client = OpenAI(
        # 控制台获取key和secret拼接，假使控制台获取的APIPassword是123456
        api_key="ipzotlGevNqQsafvWSXi:cooExiNRkHtQtHkkIqNk", 
        base_url = 'https://spark-api-open.xf-yun.com/v1'
    )
    completion = client.chat.completions.create(
        model='lite', # 指定请求的版本
        messages=[
            {
                "role": "user",
                "content": f"请分析以下学生的编程数据，并在最后给出总结: {data}"
            }
        ]
    )
    # 提取纯文本内容（关键修改）
    result_content = completion.choices[0].message.content
    print(result_content)  # 直接输出内容，而非整个对象
    
# def analyze_data(data):
#     client = OpenAI(
#         # 控制台获取key和secret拼接，假使控制台获取的APIPassword是123456
#         api_key="bce-v3/ALTAK-OWYLnTjefANZQlbFAh7vJ/25eb5517b2ce511a6365fb94f4e6f2d62ab0eb45", 
#         base_url = 'https://qianfan.baidubce.com/v2'
#     )
#     completion = client.chat.completions.create(
#         model='deepseek-v3', # 指定请求的版本
#         messages=[
#             {
#                 "role": "user",
#                 "content": f"请分析以下学生的编程数据，并在最后给出总结: {data}"
#             }
#         ]
#     )
#     # 提取纯文本内容（关键修改）
#     result_content = completion.choices[0].message.content
#     print(result_content)  # 直接输出内容，而非整个对象

